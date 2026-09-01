# Besample dynamic-frontier recruitment: live country-rating matrix

## Context

We're running a Besample recruitment campaign with a specific goal: get at least 10 ratings per
statement from each of 16 target countries, while maximizing statement/country coverage under a
fixed budget. `commonsense-data/.scripts/besample/sampling_20260723/strategy.md` specifies the
algorithm (a "row-priority dynamic frontier": always recruit toward whichever statements are
cheapest to finish across all 16 countries, and stop each cell at exactly 10 ratings).

That strategy assumes a live system that knows `n(i,j)` — ratings per statement per country — at
recruitment time. Before this change, the platform had no such thing: country-targeted
participants were served from `country.experiment.ts`, which handed out fixed, pre-built statement
bundles (the `countryblocks` table, populated by hand via TablePlus) with a quota tracked per
*block*, not per statement. There was no way to compute "how many ratings does statement X have
from country Y right now" without waiting for `commonsense-data`'s nightly pull from RDS.

This change makes `commonsense-platform` the source of truth for that matrix, updated as
participants complete the survey (not once or twice a day), and implements the actual strategy
against it.

## What changed, in one paragraph

A new table (`statementcountryratings`) tracks confirmed ratings per (statement, country) for the
16 Besample-recruitable countries. A new experiment (`besample-sampling`) replaces
`country.experiment.ts`: it detects a Besample-referred participant (`tc`/`bpid`/`bnum`/`battempt`
URL params), resolves their country from `tc`, and dynamically assembles their 15 statements from
whichever unfilled cells are currently highest-priority for that country — recomputed fresh on
every request rather than served from a pre-built bundle. The matrix updates live from **two**
paths: a Besample participant finishing their survey, and an organic (non-Besample) participant
finishing and self-reporting one of the 16 countries in demographics. A one-off script backfills
the matrix from all pre-existing historical data.

---

## 1. Live matrix: `statementcountryratings`

**New:** `server/src/db/migrations/20260901120000-add-statement-country-ratings.cjs`,
`server/src/db/models/statementcountryrating.ts`, wired into `db/models/index.ts`.

One row per (statement, country) that has ever received a rating: `statementId`, `countryCode`
(zero-padded ISO-3166 numeric, same convention as the old `countryblocks.countryCode`),
`confirmedCount`. Only the 16 tracked countries ever get rows — see
`server/src/survey/experiments/utils/besample-countries.ts`, a hardcoded list mirroring
`besample_costs.csv`'s current 16 countries (Argentina, Brazil, Egypt, Ghana, India, Indonesia,
Japan, Kazakhstan, Kenya, Mexico, Nigeria, Pakistan, Philippines, South Africa, Turkey, Ukraine).

**Deliberately no persisted "pending/reservation" counter.** In-flight (unfinished, not-yet-timed-out)
sessions are counted live by querying `experiments` directly, mirroring how the old country-bundle
in-flight check already worked — this avoids a second mutable counter that would need careful
decrement-on-timeout handling.

## 2. Row-priority ranking and assignment: `besample-matrix.ts`

**New:** `server/src/survey/experiments/utils/besample-matrix.ts`

- `getGlobalOrder()` — computes `R(i) = Σⱼ remaining(i,j)` for every published statement across
  the 16 countries, drops fully-filled statements, sorts ascending. Cached in-process and
  lazily recomputed once stale (default 1 hour, `BESAMPLE_MATRIX_REFRESH_MS` env override) —
  matches the strategy doc's "recomputed regularly, e.g. every hour." Safe as an in-memory cache
  because the ECS service runs a single task (`desired_count = 1`); would need rethinking if that
  ever changes.
- `getLivePending(countryCode)` — live count of statements reserved by unfinished
  `besample-sampling` sessions within the last **45 minutes** (the strategy's session timeout;
  the old country-bundle used 30 minutes — these are intentionally different features now).
- `computeActiveSet(countryCode, size=15)` — the next participant's statement set: the top
  unfilled statements for that country in global-priority order, net of live pending reservations.
  Recomputed fresh on every assignment (no persisted per-country pointer) — simpler and stateless
  across requests/restarts, while still satisfying the strategy's behavioral requirements.
- `bumpCountryRatings(countryCode, statementIds)` — confirms ratings (transactional
  upsert-and-increment), called from two places (see §4).

## 3. New experiment: replaces `country.experiment.ts`

**New:** `server/src/survey/experiments/besample.experiment.ts`
**Deleted:** `server/src/survey/experiments/country.experiment.ts` and its test
(`country-experiment.test.ts`, replaced by `besample-experiment.test.ts`)

`experimentName: 'besample-sampling'`, `priority: 100` (same precedence as the old country-bundle).
Eligible whenever any of `tc`/`bpid`/`bnum`/`battempt` is present on the request (all four are
already forwarded unfiltered by the client and captured into `experiments.urlParams` — confirmed
no client-side changes were needed). Assigns `computeActiveSet(...)` for the `tc`-resolved country;
returns `null` (falls through to `daily-experiment` → the weighted-random default, same fallback
chain every other experiment already uses) when `tc` is missing/unmappable or that country's queue
is currently exhausted.

The `countryblocks` table/model and its data are **left untouched** — no destructive migration.
They're just no longer written to by new assignments.

## 4. Two paths feed the live matrix

**Changed:** `server/src/controllers/experiment.ts`

- **`saveExperiment`** — when a finished experiment is `besample-sampling`, confirms ratings for
  its assigned statements at its resolved country (same non-fatal try/catch pattern as the
  existing country-bundle counter bump it sits alongside).
- **`saveIndividual`** — when a participant completes demographics, if their self-reported
  `country_reside` matches one of the 16 tracked countries, their session's answered statements
  are confirmed at that country too — **unless** they already went through `besample-sampling`
  (guarded by checking for an existing `experiments` row of that type for the session, to avoid
  double-counting). This is per explicit product direction: the matrix should reflect ratings from
  the 16 countries regardless of whether the participant arrived via Besample or a normal link.
  Fire-and-forget, matching the endpoint's existing non-blocking contract.

Worth knowing: this fires when demographics completes, which is slightly before `saveExperiment`
marks the survey `finished` (demographics is the last auxiliary step before the final Result
screen, which is what calls `/experiments/save`) — treated as "close enough to done" rather than
waiting for the literal `finished` flag.

## 5. Historical bootstrap

**New:** `server/scripts/bootstrap-country-matrix.ts`, `server/scripts/lib/iso-country-codes.ts`,
`server/src/db/seeds/all_matches_hungarian.csv` (static, 5.7 MB, 27,891 rows — copied from
`commonsense-data/demo_matches/`, which will not be updated again)

A manually-run (`npm run bootstrap:country-matrix`), idempotent, full-recompute script — **not**
part of the automatic `migrate:deploy` path. Ports two pieces of logic from
`commonsense-data/.scripts/visualize/update-data.py`, applied against this repo's own live tables
instead of stale CSVs:

1. **Session matching** — a historical bug assigned different session IDs to the same
   participant's answers/CRT/RME/demographics records. Bug-affected sessions are pre-resolved in
   the static Hungarian-matching CSV; sessions created after the fix already share one consistent
   ID across all four record types (computed directly from the live tables).
2. **Besample country override** — self-reported `country_reside` is overridden by a valid
   Besample recruitment code (`tc`/`c_code` in historical `experiments.urlParams`) whenever one
   exists, even if it disagrees with self-report — exactly mirroring `update-data.py`'s logic. This
   needed the *full* ISO-3166 numeric table (not just the 16 tracked codes), since an override can
   validly resolve to an untracked country, which must **not** fall back to self-report.

Restricted to `published` statements and the 16 tracked countries; writes are a full
delete-and-replace of those countries' rows (safe to re-run).

## 6. `commonsense-data`: no changes

`update-data.py` was briefly modified during development to restrict `data/answers.csv` to
published statements only, mirroring the recruitment strategy's scope. That was reverted at the
user's request — `commonsense-data`'s own pipeline intentionally keeps unpublished statements, for
consumers other than this recruitment strategy. The published-statements restriction only applies
inside `commonsense-platform` (the live matrix and the bootstrap script both already scope to
`statements.published = true` directly from this repo's own DB — see §2 and §5), so no change to
`commonsense-data` was needed after all.

## 7. How to add more Besample countries later

If Besample makes more countries available for recruitment, only one file needs a code change:
`server/src/survey/experiments/utils/besample-countries.ts` — add `{ code, name }` entries to
`BESAMPLE_COUNTRIES`. Every other piece of this feature (`besample-matrix.ts`'s `R(i)` computation,
`besample.experiment.ts`'s validity/assignment, the `saveIndividual`/`saveExperiment` hooks, and
`bootstrap-country-matrix.ts`) reads `BESAMPLE_COUNTRY_CODES`/the resolver functions generically, so
nothing else needs to change.

Two things to get right per new entry:

1. **`code`** — ISO 3166-1 numeric, zero-padded to 3 digits (same convention `tc` already uses).
   `server/scripts/lib/iso-country-codes.ts` has the full 249-country table if you need to look one
   up.
2. **`name`** — must match **exactly** (case-sensitive) how that country appears as a
   `country_reside` answer option in `@watts-lab/surveys`' demographics question, since
   `resolveCountryCodeFromName` does a plain string match against the self-reported value (used by
   the organic/non-Besample path — see §4). Verify this against
   `client/node_modules/@watts-lab/surveys/dist/index.js` (or the installed package's source) for
   each new country; a name phrased differently there (accented, "official" form, etc.) would
   silently never match self-report and only ever get counted via a Besample `tc` override.

After editing the list:

- **Re-run `npm run bootstrap:country-matrix`** — it fully deletes and recomputes
  `statementcountryratings` for whatever's currently in `BESAMPLE_COUNTRY_CODES`, so re-running it
  backfills historical ratings for the newly-added countries too (from existing self-reported/
  Besample-tagged answers already in the DB), rather than letting them start from a cold empty
  matrix.
- **Update `besample-countries.test.ts`** — it currently asserts `BESAMPLE_COUNTRIES`/
  `BESAMPLE_COUNTRY_CODES` have length 16; bump that to match.

No migration, schema change, or client change is needed — `statementcountryratings.countryCode` is
a plain `STRING(3)` column, not a fixed enum.

Out of scope for this repo: `commonsense-data`'s `strategy.md` and `besample_costs.csv` describe the
*campaign/budget* side (which countries actually get recruitment links and how a fixed budget
splits across them) — this platform deliberately doesn't manage that. If the new countries should
also be recruited from, those need updating separately over there.

---

## Testing

- `npm run build` (tsc) and `npm test` (Jest, 25 suites / 137 tests) both pass clean; `npm run
  lint` shows zero new issues on every file touched or added (the codebase has ~200 pre-existing
  lint errors elsewhere, none of them touched by this change).
- New unit tests: `besample-countries.test.ts`, `besample-matrix.test.ts` (including a case
  verifying live-pending correctly subtracts from remaining need), `besample.experiment.test.ts`,
  plus additions to the existing `experiment.test.ts` for the two new `saveExperiment`/
  `saveIndividual` branches.
- New integration tests (real SQLite, `supertest`): `besample-experiment.test.ts` (9 cases —
  assignment ordering, zero-padding, country/queue fallbacks, in-flight reservation and its
  45-minute timeout, confirmed-count bump on completion, resume behavior) and
  `bootstrap-country-matrix.test.ts` (exercises the actual bootstrap script against a seeded
  in-memory DB: self-report path, Besample-override path, untracked-country exclusion, unpublished-
  statement exclusion, and re-run idempotency).
- That last test caught a real bug during development: reading a JSON column with Sequelize's
  `raw: true` under SQLite returns it unparsed, silently breaking self-report country resolution.
  Fixed by reading via model instances + `.get()`, matching the convention already used elsewhere
  in this codebase.

## Rollout notes for whoever deploys this

1. Run the new migration (`npm run migration:up` / the deploy-time `migrate:deploy` path — it's a
   normal additive migration, nothing special needed).
2. Run `npm run bootstrap:country-matrix` once, manually, against production data, to seed
   `statementcountryratings` from all pre-existing history before the new experiment starts relying
   on it. It's idempotent, so re-running it later to reconcile is safe.
3. No client (`client/`) changes were needed — the frontend already forwards all URL params and
   experiment metadata generically.
4. No `commonsense-data` changes are needed — see §6.
