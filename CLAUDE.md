# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Commonsense Platform: an Express.js API + React SPA that runs an online survey (the "common sense" study). Users answer statements, get assigned into experiments/treatments, and results are aggregated into a public dashboard. Monorepo split into `client/` (Vite + React + TS) and `server/` (Express + Sequelize, TypeScript), deployed together via Docker to AWS ECS (see `deploy/`, Terraform).

## Commands

### Server (`server/`)
- `npm run dev` — start with `ts-node-dev` (auto-restart) on port 4000; loads `.env` via `dotenv`
- `npm test` — run Jest (ts-jest) against an in-memory SQLite DB (no real DB needed)
- `npx jest src/tests/integration/experiment.test.ts` — run a single test file (tests live under `src/tests/{integration,unit}`, matched as `src/tests/**/*.test.ts`)
- `npx jest -t "test name"` — run tests matching a name
- `npm run build` — compile TS (`tsc`) to `dist/`; `npm start` runs `dist/server.js`
- `npm run migration:up` / `migration:down` — run/undo Sequelize migrations locally (`sequelize-cli db:migrate` / `db:migrate:undo`) against a real MySQL/MariaDB DB, not for `npm test`
- `npm run migration:generate --name <name>` — scaffold a new migration under `src/db/migrations`
- `npm run migrate:deploy` — the deploy-time migration runner (`scripts/migrate.cjs`), invoked by the Dockerfile CMD on container start; see notes below

### Client (`client/`)
- `npm run dev` — Vite dev server on port 5173, proxies/talks to the server on 4000
- `npm test` — Vitest unit tests (jsdom env, coverage thresholds enforced at 80% in `vite.config.ts`)
- `npx vitest run src/path/to/file.test.tsx` — run a single test file; `npx vitest` for watch mode
- `npm run lint` / `npm run lint:fix` — ESLint over `src`
- `npm run build` — TypeScript build + Vite production build
- `npx cypress open` / `npx cypress run` — e2e tests (`client/cypress`); require the server running against a real MySQL/MariaDB DB with the seed data in `test/init.sql.zip` (see `.github/workflows/test-e2e.yml` for the full local recipe: build the server, run `migrate:deploy`, start `dist/server.js`, then run Cypress against the Vite dev server)

### Local full-stack dev
`docker-compose.yml` brings up a MariaDB instance on port 3306 for local development. Run server and client dev servers separately against it. There is no `.env.example` checked in — check `server/src/config/config.ts` and `server/src/server.ts` for the env vars a given run needs (`DB_HOST`/`DB_USER`/`DB_PASSWORD`/`DB_NAME`/`DB_PORT`, `DB_DRIVER`, `SESSION_SECRET`, `JWT_SECRET`, `IP_FLUSH_INTERVAL_MS`, `GITHUB_HASH`, Meta CAPI vars, etc.).

## Architecture

### Experiment / treatment plugin system (the core domain logic)
The survey doesn't serve a fixed question set — each session is routed through a pluggable experiment system in `server/src/survey/`:

- **Experiments** (`server/src/survey/experiments/*.experiment.ts`) are auto-discovered by `experiments/index.ts` (every `*.experiment.(js|ts)` file in the directory is `require`d and collected into an array — dropping a new file in is enough to register it, no manual wiring). Each experiment exports (default export) `{ experimentName, priority, treatments, treatmentAssigner }`.
- **Treatments** (`server/src/survey/treatments/*.treatment.ts`) are the underlying statement-selection functions (e.g. `weighted-random.treatment.ts`, `statement-by-id.treatment.ts`, `design-point.treatment.ts`), similarly auto-discovered and merged by `treatments/index.ts`.
- Request flow, orchestrated by `returnStatements` in `controllers/experiment.ts`:
  1. If the session has an unfinished experiment (`experiments` row with `finished: false`), resume it (merging in any answers already saved) rather than reassigning — this matters because assigners can have side effects (e.g. incrementing counters), so resuming must short-circuit before assigners run.
  2. Otherwise, each experiment's treatments are filtered by a `validity(req, params)` predicate (e.g. `country.experiment.ts` only applies when a `tc` country-code URL param is present).
  3. Each eligible experiment's `treatmentAssigner(validTreatments, req)` runs (may have DB side effects, e.g. bumping a country block's `assignedCount`) and returns an assigned treatment or `null`.
  4. Among experiments that produced an assignment, the highest `priority` wins (default 0); ties broken randomly. If nothing is eligible, falls back to the default `GetStatementsWeighted` treatment.
  5. The winning treatment's `function` runs to actually pick statements, and a row is created in `experiments` (Sequelize) recording the assignment.
- Current experiments: `country.experiment.ts` (`country-bundle`, priority 100 — see below), `daily.experiment.ts` (`daily-experiment`, one fixed low-answer-count statement set per calendar day, one per session per day), `integrative.experiment.ts` (`design-point`) and `previous.experiment.ts` (`design-design_point-old-statements`) — the latter two are large lists of hardcoded per-design-point statement-ID blocks gated by date-range `validity` checks and are effectively dormant now (their `treatmentAssigner`s filter down to an empty candidate list), kept around as a historical/reference record of past design-point runs rather than active experiments.
- `country.experiment.ts` is the best reference for a fully active experiment: it targets participants by ISO-3166 numeric country code (`tc` URL param, e.g. from BeSample, zero-padded to 3 digits), serves pre-built statement "blocks" (`countryblock` model) up to a quota (`BLOCK_QUOTA`), and tracks both completed (`completedCount`, bumped in `saveExperiment` on finish) and in-flight/unfinished-but-reserved counts (via the `experiments` table, `experimentType: 'country-bundle'`) to avoid overcommitting a block — in-flight reservations expire after `INFLIGHT_TTL_MS` (30 min) so abandoned sessions free their slot.
- `weighted-random.treatment.ts` (`GetStatementsWeighted`) selects statements weighted by how rarely they've been answered (fewer prior answers → higher selection weight), via a raw SQL query keyed by a per-language column (see `languageMap`), then applies a deterministic per-session shuffle (`seededShuffle`) so a resumed/refreshed session sees a stable order.
- Adding a new experiment = add a new `*.experiment.ts` file following this shape; no changes needed elsewhere. Same for treatments.

### Server structure (`server/src/`)
- `server.ts` — Express app setup: helmet CSP, CORS (`credentials: true, origin: true`), cookie parsing, MySQL-backed session store (`express-mysql-session`, skipped when `NODE_ENV=test`; config built by `config/sessions.config.ts`), a feedback-route rate limiter, and an in-memory IP-tracking cache periodically flushed to the `ipaddress` table (interval via `IP_FLUSH_INTERVAL_MS`, skipped entirely in test env). Routers are mounted per resource under `/api/*`. DB connectivity check on boot uses `sequelize.authenticate()`; `DB_SYNC=true` opts into `sequelize.sync()` instead (schema sync is otherwise migration-driven, not sync-driven).
- `controllers/` — one file per resource holding request-handling logic; `routes/` just wires HTTP verbs to controller functions.
- `db/models/` — Sequelize models. Unlike a typical auto-loader setup, `db/models/index.ts` explicitly imports every model file, builds one shared `Sequelize` instance from `config/config.ts`, and wires associations by hand (e.g. `statements.hasMany(answers, { onDelete: 'RESTRICT' })` so a statement with answers can never be deleted; `treatments.hasMany(usertreatments, { onDelete: 'RESTRICT' })`). `models.ts` at the `src/` root just re-exports `db/models` for shorter import paths elsewhere.
- `config/config.ts` — per-`NODE_ENV` DB config (`development`/`test`/`production`); `test` always forces in-memory SQLite regardless of `.env`. `resolveDialect()` always resolves to the `mysql` dialect (mysql2 driver) even when `DB_DRIVER` requests `mariadb` — the `mariadb` Sequelize dialect targets the mariadb@2.x driver's result shape and throws under the installed mariadb@3.x driver (unfixed upstream: sequelize/sequelize#16262); the RDS MariaDB instance is wire-compatible with the `mysql` dialect, so this is a deliberate workaround, not a bug to "fix" by switching it back.
- `db/migrations/` — Sequelize migrations, run via `.sequelizerc` config pointing at `src/config/sequelize.config.cjs`. `scripts/migrate.cjs` (the deploy-time runner invoked by the Dockerfile) handles baselining: a legacy production DB built by the old `sequelize.sync()` has all core tables but no `SequelizeMeta` table, so on deploy it detects that case (a marker table present + no `SequelizeMeta`) and records the base `create-core-tables` migration as already-applied before running `sequelize-cli db:migrate` for real — don't assume every environment starts from an empty schema.
- Meta/Facebook CAPI events (`controllers/meta.ts`, `sendMetaEvent`) fire on survey completion (`saveExperiment`) — non-fatal if they error, must never block the user-facing response.

### Client structure (`client/src/`)
- Vite + React 18 + TypeScript, React Router for navigation (`src/App.tsx` is the route table), Tailwind + DaisyUI for styling.
- `src/context/SessionContext.tsx` is the central client-side session store (not Redux, despite `@reduxjs/toolkit` being a dependency) — tracks `sessionId` (fetched from the server and persisted to `localStorage`), signed-in `user`, and captured URL params, and syncs across tabs via the `storage` event.
- `src/apis/backend.ts` is the shared Axios instance for all API calls to the Express server.
- `src/pages/` are route-level screens (survey flow: `ConsentPage` → `SurveyPage` (route `/statements`) → `Finish` → `Welcome`); `src/components/` and `src/partials/` hold reusable and layout pieces respectively.
- i18n via `i18next` (config in `src/i18n/`); the survey statements/questions themselves support multiple languages at the DB layer (see the `languageMap` in `weighted-random.treatment.ts` — each language is a separate column on `statements`, not a separate table).
- `src/data/questions.ts` / `demographics.json` / `llmEvals.json` are static content driving parts of the UI (e.g. `LlmEvals` page, demographic questions) independent of the dynamic experiment/treatment system above.

### Testing
- Server: Jest (ts-jest) + Supertest, run against in-memory SQLite (`NODE_ENV=test` forces this in `config/config.ts`) — no external DB needed for `npm test`. `src/tests/setupEnv.ts` runs before any test module loads so env vars read at import time (e.g. `JWT_SECRET` in the auth controllers) are always set. Integration tests in `src/tests/integration/` exercise full routes; unit tests in `src/tests/unit/`.
- Client: Vitest (jsdom) for unit tests with an 80% coverage threshold; Cypress for e2e, which needs a real MySQL/MariaDB instance and a running built server (`npm run build` then `node dist/server.js`) — see `.github/workflows/test-e2e.yml` for the exact env vars and seeding steps (it uses MariaDB 10.6 to match production RDS, and unzips `test/init.sql.zip` to seed the DB).

### Infrastructure (`deploy/`)
Terraform for the AWS stack (`us-east-1`, ECS). The VPC/subnets/route tables/IGW are managed by UPenn ISC and referenced as read-only Terraform `data` sources — don't try to manage them here. The ACM cert is referenced by ARN only. Secrets (`server.env`) live in S3 and are intentionally not Terraform-managed. Terraform state is local (not yet a remote backend).
