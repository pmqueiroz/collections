# CI/CD

No CI provider is configured yet. The only automated gate is the local
lefthook pre-commit hook.

Toolchain is Node 24 LTS, pinned in `.tool-versions` and `engines.node`.
Bump both together, and use the same version in CI once it exists.

## Local gate: lefthook

`lefthook.yml`, installed into `.git/hooks` by the `prepare` script
(`lefthook install`) on `npm install`. `pre-commit` runs in parallel:

- **`biome`** — `biome check --write` on staged JS/TS/JSON/CSS files;
  fixes are re-staged (`stage_fixed`). Fails the commit on unfixable lint
  errors, including the import-alias ban.
- **`typecheck`** — `npm run typecheck` (`next typegen && tsc --noEmit`)
  whenever a `.ts`/`.tsx` file is staged. Runs on the whole project because
  `tsc` cannot check single files against the project config.

`next build` no longer lints (Next.js 16), so lint must run via the hook or
`npm run lint`.

## Scripts

- `dev` / `build` / `start` — Next.js.
- `lint` — `biome check` (lint + format + import sorting, read-only).
- `format` — `biome format --write`.
- `typecheck` — `next typegen && tsc --noEmit`.

## Not set up yet

CI workflow, tests, preview/production deployment. A CI job should run
`npm ci`, `npm run lint`, `npm run typecheck`, `npm run build` on Node 24.
