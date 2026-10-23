# Coding conventions & authoring rules

How code is written in this project. These are hard rules, not suggestions. This file is about **how to
author** code and where documentation lives.

## No comments in code

Code carries **no comments**. Do not:

- Explain a function with a comment above it.
- Annotate a line because it "might need documenting".
- Leave TODO/NOTE/why-notes inline.

If something needs explaining — a business rule, a non-obvious decision, a
gotcha — it belongs in `.refs/`, **always**. The code says *what*; `.refs/`
says *why*. A comment is a signal that a `.refs/` entry is missing: write the
entry instead.

Name things well enough that the code reads without prose. Extract a
well-named function or variable instead of writing a comment.

## Copy rules (adjust to this project)

If the project has user-facing copy with its own style rules (banned
punctuation, tone, casing), state them here explicitly so they're
enforceable rather than tribal knowledge. Example shape:

> User-facing strings never use an em dash (`—`). Split the sentence, or use
> whichever of period, comma, or colon actually fits.

This is a copy rule, not a prose rule — `.refs/` docs and commit messages are
unaffected by it.

## Documentation lives in `.refs/`

Every explanation of code behavior or business rule goes in the matching
`.refs/` file (see [AGENTS.md](../AGENTS.md) for the map). When you add or
change a feature, updating the `.refs/` doc is **part of the task**, not a
follow-up — the Operating Protocol in AGENTS.md is binding.

## Components must be reusable, and reused

The UI (or equivalent shared surface — a component library, a shared API
layer, a common CLI framework) is built from **shared, reusable pieces**. One
concept = one component, used everywhere that concept appears. Do not
reimplement the same behavior or interaction in two places.

Before building something new, check whether an existing piece already does
it (or nearly does it). If a near-match exists, **generalize and reuse it**
rather than copy-pasting a variant. If you build something likely to appear
again, extract it to the shared location from the start.

Consistency is the goal: the same interaction should look and behave the same
everywhere in the project.

## Dev-only code

Anything that must exist in `next dev` and never in production follows two
rules, so the production bundle carries none of it:

- **Dev-only routes** are named `page.dev.tsx` (any `*.dev.{tsx,ts,jsx,js}`
  route file). `next.config.ts` exports a phase function that adds the
  `dev.*` page extensions only for `PHASE_DEVELOPMENT_SERVER`; `next build`
  does not see those files as routes, so they and everything only they
  import are never compiled. Do not use `PageProps<...>` in them: `next
  typegen` runs outside the dev phase and does not generate their route
  types, so type `params` by hand.
- **Dev-only UI inside shared components** is wrapped inline in
  `process.env.NODE_ENV === "development" && (...)`. Next inlines
  `NODE_ENV`, so the branch and its imports (e.g. `DevLink`) are removed
  from the production chunks. Keep the check inline: a shared `DEV`
  constant from another module is not guaranteed to be folded.
- Dev-only controls are **yellow** (`DevLink` / `devButtonClass` in
  `components/ui/dev-link.tsx`, tokens `dev`, `dev-hover`, `dev-line`) so
  they never pass for real UI. Their copy is English only and not in the
  dictionaries (the dictionaries ship to production).
- Server code reachable from a dev route still re-checks `NODE_ENV`
  (see `saveRelic`) as a second guard.

Verify after touching this: `npm run build`, then grep `.next/static` and
`.next/server` `*.js` for a dev-only string; only source maps and the
Tailwind `.bg-dev`/`.border-dev-line` CSS rules (Tailwind scans every source
file) may mention it.

## Imports

No import aliases. Every local import is a relative path
(`../components/button`), never `@/…`, `~/…` or `#…`. `tsconfig.json` has no
`paths`/`baseUrl`, and Biome's `style/noRestrictedImports` rule in
`biome.json` errors on those prefixes, so the pre-commit hook blocks them.

Biome is the only linter/formatter; there is no ESLint or Prettier config.
Import order is managed by Biome's `organizeImports` assist.

Rule exceptions go in `biome.json` `overrides`, scoped by path, never as
`biome-ignore` comments (see [No comments in code](#no-comments-in-code)).
Current one: `noImgElement` is off for `app/**/opengraph-image.tsx`, since
Satori renders plain `<img>` and `next/image` does not apply there.
