# CI/CD

GitHub Actions, `.github/workflows/ci.yml`. Runs on every push to `main` and
every PR into `main`. PR runs on the same ref cancel each other; production
deploys are serialized (`deploy-production` group, never cancelled).

Toolchain is Node 24 LTS, pinned in `.tool-versions` and `engines.node`.
CI reads `.tool-versions` through `actions/setup-node`'s `node-version-file`,
so bumping the file bumps CI.

## Jobs

- **`checks`** — `npm ci`, `npm run lint` (Biome), `npm run typecheck`. Gate
  for everything else.
- **`deploy`** — only on push to `main`, needs `checks`. Installs the pinned
  Vercel CLI (`vercel@65.1.0`) and runs the prebuilt flow:
  `vercel pull --yes --environment=production` → `vercel build --prod` →
  `vercel deploy --prebuilt --prod`. Runs in the GitHub `production`
  environment with URL https://collections.pmqueiroz.dev.

## Vercel project

- Project `collections` on team `peam`, framework `nextjs`.
- **No Git integration.** The project was created with `vercel project add`
  and is not connected to the GitHub repo, so Vercel never builds on its own;
  GitHub Actions is the only deploy path. Do not run "Connect Git Repository"
  in the dashboard, it would double-deploy.
- Local link: `.vercel/project.json` (gitignored), via
  `vercel link --project collections --team peam`.
- Production env vars on Vercel: `ARCHIVE_SESSION_SECRET` (random, sensitive),
  `ARCHIVE_USER`, `ARCHIVE_PASSWORD` (see [archive.md](./archive.md)).
  `vercel pull` brings them into the CI build.

## Repo configuration

- Secret `VERCEL_TOKEN` — Vercel access token (created in the dashboard; the
  CLI login cannot mint tokens).
- Variables `VERCEL_ORG_ID` (`team_rrYDtLlOHAbewTOtRsKUekX9`) and
  `VERCEL_PROJECT_ID` (`prj_UEig0MF6Rb8lTTjnBmC9Vfju18cB`) — not secret; they
  let the CLI skip `vercel link` in CI.

## Domain

`collections.pmqueiroz.dev` is attached to the project. DNS for
`pmqueiroz.dev` is on Cloudflare (`ezra`/`demi.ns.cloudflare.com`) and is
managed manually, because Wrangler has no DNS commands and its OAuth scopes
cannot edit DNS records. Required records:

| Type  | Name                   | Value                                   | Proxy    |
| ----- | ---------------------- | --------------------------------------- | -------- |
| CNAME | `collections`          | `fafa465878c3eb4d.vercel-dns-017.com`   | DNS only |
| TXT   | `_vercel`              | `vc-domain-verify=collections.pmqueiroz.dev,bd4c3d1433d2a95f746d` | — |

The TXT record is needed because `pmqueiroz.dev` is already registered with
another Vercel team. Keep the CNAME unproxied (grey cloud) so Vercel can
issue the certificate.

## Local gate: lefthook

`lefthook.yml`, installed into `.git/hooks` by the `prepare` script
(`lefthook install`) on `npm install`. `pre-commit` runs in parallel:

- **`biome`** — `biome check --write` on staged JS/TS/JSON/CSS files;
  fixes are re-staged (`stage_fixed`). Fails the commit on unfixable lint
  errors, including the import-alias ban.
- **`typecheck`** — `npm run typecheck` (`next typegen && tsc --noEmit`)
  whenever a `.ts`/`.tsx` file is staged. Runs on the whole project because
  `tsc` cannot check single files against the project config.

`next build` no longer lints (Next.js 16), so lint must run via the hook,
`npm run lint`, or the CI `checks` job.

## Scripts

- `dev` / `build` / `start` — Next.js.
- `lint` — `biome check` (lint + format + import sorting, read-only).
- `format` — `biome format --write`.
- `typecheck` — `next typegen && tsc --noEmit`.

## Not set up yet

Preview deployments for PRs, tests.
