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

## 8. Two duplicate-participant edge cases found in early live data

After the initial rollout, real Besample data surfaced two different ways a participant could end
up with two `experiments` rows sharing one `sessionId` — each with a different root cause and a
different fix.

### 8a. Same participant revisits after finishing (server-side fix)

A Nigerian participant's `experiments` table showed two rows with **identical** Besample
identifiers (`assignment_id`/`battempt`, `response_id`/`bnum`, `bpid` all the same), ~1 minute apart:
they finished the whole flow once, then landed back on the same URL (back button/reload) and
re-answered the same 15 statements a second time — but without redoing CRT/RME/demographics, since
those "already completed" flags are separate, standalone localStorage keys that survive the revisit.

Root cause: `besample.experiment.ts`'s `treatmentAssigner` had no "already assigned" guard, unlike
`daily.experiment.ts`. Step 1 of `returnStatements` only resumes an *unfinished* experiment; once the
first row is `finished: true`, a revisit falls straight back through to the assigners, which happily
mint a brand-new besample-sampling row and active set.

**Fix**: `besample.experiment.ts`'s `treatmentAssigner` now checks whether this `sessionId` already
has *any* `experiments` row with `experimentType: 'besample-sampling'` (regardless of finished
state — by the time the assigner runs, step 1 has already ruled out an unfinished one) and returns
`null` if so, falling through to `daily-experiment`/default instead of reassigning. This is a
once-per-session-ever guard, unlike `daily-experiment`'s once-per-calendar-day one.

New tests: `besample-experiment.test.ts` reproduces the exact reported flow (assign → finish →
revisit with the same session/`tc`) and asserts only one `besample-sampling` row ever exists for
that session; `besample.experiment.test.ts` covers the guard at the unit level.

### 8b. Two different Besample assignments, same browser (client + server fix)

An Indian participant's two `experiments` rows told a different story: **completely different**
Besample identifiers on each row (different `assignment_id`/`battempt`, `response_id`/`bnum`, and
`bpid`), but the exact same `sessionId`, and the second pass replayed all 15 answers essentially
identically to the first (and much faster) — consistent with the same browser being used for two
distinct, separately-payable Besample assignments (whether that's one person deliberately replaying
the link to double-claim, or two different people sharing a device).

This one turned out to have **three** compounding root causes, only two of which were visible from
reading the code alone — the third only surfaced once the fix was actually exercised end to end with
Cypress against a real DB and a real browser (see the testing note at the end of this section for why
that almost didn't happen). Reviewing this fix from a code diff alone would have missed it.

**Root cause 1 — this app's own "already completed" state.** `sessionId`, `consent`, and the
`CRT`/`rmeTen`/`demographicsLongInternational` flags Layout.tsx checks all live in `localStorage`
keyed only by name, with nothing tying them to *which* Besample assignment is active. A second,
genuinely different assignment opened in the same browser silently inherits the first assignment's
session, consent, and completed-surveys state.

**Root cause 2 — `@watts-lab/surveys`' own autosave, a *different* set of keys.** Independently of
the flags above, that library saves `{ currentPageNo, data, timeSpent }` to its own `storageName`
key on every answer and restores from it on mount (`storageName="crt"`/`"rmeten"`/`"demographics"`,
per Layout.tsx's `<CRT>`/`<RmeTen>`/`<DemographicsLongInternational>` props) — entirely separate
from, and unrelated to, the completion flags in root cause 1. Left alone, a second participant's RME
would resume from wherever the first participant's `currentPageNo` last landed — including jumping
straight to the final question if the first participant had just finished.

**Root cause 3 — `sessionId` doesn't actually originate on the client at all.** `GET /api`
(`server.ts`) just returns `req.sessionID`: the `express-session` id, tied to an `httpOnly` cookie
(`survey-session`, see `config/sessions.config.ts`) that JavaScript can never read or clear. No amount
of clearing `localStorage.sessionId` changes what the *server* hands back, because the server is
still looking at the same cookie. This is the one that only showed up once the fix was run against a
real browser/cookie jar instead of just read.

**Fix, part 1 (client)** — `client/src/utils/besampleAttempt.ts`'s `resetStorageForNewBesampleAttempt`
compares the URL's Besample attempt id (`battempt`, falling back to `bnum`) against one recorded in
localStorage from the last visit; if a *different* one was already recorded, it wipes every
participant-scoped localStorage key — both root-cause-1's (`sessionId`, `consent`, `CRT`, `rmeTen`,
`demographicsLongInternational`, `statementsData`, `urlParams`) and root-cause-2's (`crt`, `rmeten`,
`demographics`) — before anything else reads them, and records the new attempt id.
`SessionContext.tsx`'s `SessionProvider` calls this once, synchronously, before its own `useState`
initializers read any of those keys.

**Fix, part 2 (server, for root cause 3)** — `SessionContext.tsx`'s session-init request now sends
the current attempt id as a `battempt` query param to `GET /api`. That handler (`server.ts`) compares
it against one recorded on `req.session` and, if different, calls `req.session.regenerate()` before
responding — issuing a genuinely new session id *and* a new `Set-Cookie`, which is the only way to
actually get a fresh identity out of an `httpOnly`-cookie-backed session. Without this half, the
client-side reset alone is cosmetic: the server still hands back the old session id regardless.

Together, a same-attempt revisit (§8a's case) leaves everything untouched (attempt id unchanged, no
regenerate); so does this browser's very first-ever Besample attempt (nothing recorded yet on either
side) — it just starts tracking from there, without wiping or regenerating anything for an ordinary
first-time visitor.

This doesn't stop someone from deliberately clearing cookies/localStorage by hand to bypass it —
that's a fraud-detection problem for Besample's own side, not something fixable at this layer — but
it does fix the accidental-reuse case (kiosk/shared device, or casually reopening an old tab) and
raises the cost of a deliberate replay back to redoing the entire flow, including getting a new,
separately-tracked session.

New tests:

- `client/src/utils/besampleAttempt.test.ts` (Vitest) — no-op on an unchanged attempt id, full wipe
  (all ten keys, root causes 1 and 2) on a changed one, the `bnum` fallback, and the
  first-ever-sighting no-op case.
- `server/src/tests/integration/server.test.ts` — `GET /api` regenerates the session when a
  different `battempt` shows up on the same client (same cookie jar), does *not* regenerate when the
  same `battempt` repeats or when none was previously recorded.
- `client/cypress/e2e/1-functionality/session-integrity.cy.js` gained a second `describe` block
  simulating the whole incident end to end against a real DB and a real cookie jar: complete a full
  survey under one Besample attempt, then `cy.visit` the same browser again with a *different*
  `bpid`/`bnum`/`battempt`, confirming the app redirects back to the consent gate, issues a
  brand-new `sessionId`, re-shows CRT/RME/demographics, and that both attempts end up as fully
  self-consistent, non-overlapping rows across `experiments`/`answers`/`individuals` — directly
  exercising the colleague's stated concern that this change could reintroduce the old cross-table
  sessionId-drift bug that the Hungarian-matching bootstrap (§5) was built to paper over historically.
  **This test is what actually caught root causes 2 and 3** — both were invisible from reading the
  diff and only surfaced by running the full flow against a real browser/DB; treat that as the
  cautionary tale for reviewing this kind of fix from a diff alone.

**Testing note for whoever runs this locally**: if `npx cypress run`/`open` fails immediately with
`bad option: --no-sandbox` / `--smoke-test` / `--ping=...` even after a clean reinstall, check for
`ELECTRON_RUN_AS_NODE=1` in your shell environment and unset it for the Cypress invocation (e.g.
`env -u ELECTRON_RUN_AS_NODE npx cypress run ...`) — that variable forces Cypress's bundled Electron
binary into plain-Node mode, where it can't parse its own launch flags. Not specific to this change,
but it's what blocked verifying it at all until diagnosed.

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
- §8's fixes add: a new integration case in `besample-experiment.test.ts` and a new unit case in
  `besample.experiment.test.ts` for the once-per-session guard (§8a); `client/src/utils/
  besampleAttempt.test.ts` (Vitest) plus two new `server.test.ts` integration cases for the
  localStorage-reset/session-regeneration logic (§8b). Full server suite after these: **25 suites /
  141 tests**, all passing; `npx tsc --noEmit` clean on both `server/` and `client/` for every file
  touched (the client repo has pre-existing, unrelated `tsc`/lint/coverage failures elsewhere that
  these changes don't add to or fix).
- §8b was additionally verified with real Cypress runs against the local MariaDB (not just unit
  tests) — `session-integrity.cy.js`'s new `describe` block and the existing e2e specs
  (`besample.cy.js`, `formfill.cy.js`, `home.cy.js`, `magic-link-auth.cy.js`, `persistence.cy.js`,
  `skipEndTests.cy.js`) all pass with §8's changes in place. The pre-existing
  `session-integrity.cy.js` `ipaddresses`-flush assertion is intermittently flaky on a loaded local
  machine independent of this change (confirmed by reproducing the same flake against unmodified
  code via `git stash`) — not something introduced here.

## Rollout notes for whoever deploys this

1. Run the new migration (`npm run migration:up` / the deploy-time `migrate:deploy` path — it's a
   normal additive migration, nothing special needed).
2. Run `npm run bootstrap:country-matrix` once, manually, against production data, to seed
   `statementcountryratings` from all pre-existing history before the new experiment starts relying
   on it. It's idempotent, so re-running it later to reconcile is safe.
3. §1-7 needed no client (`client/`) changes — the frontend already forwards all URL params and
   experiment metadata generically. §8b touches both sides — client (`SessionContext.tsx` +
   `besampleAttempt.ts`) and server (`server.ts`'s `GET /api` handler +
   `types/express-session.d.ts`) — a normal `npm run build`/deploy of both picks it up, no extra
   migration or session-store change needed (`req.session.regenerate()` just issues a new row in the
   existing `express-mysql-session` store; old rows expire normally).
4. No `commonsense-data` changes are needed — see §6.
