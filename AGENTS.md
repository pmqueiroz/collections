# Agent Instructions

## .refs — feature & architecture notes

Working references for how this project is built. Code is the truth; these
explain the *why* and the gotchas.

- [conventions.md](./.refs/conventions.md) — authoring rules: **no comments in
  code** (docs go in `.refs/`), reusable-component discipline. Read first.
- [architecture.md](./.refs/architecture.md) — stack, layout, data model,
  extension points, conventions. Fill in as the project takes shape.
- [archive.md](./.refs/archive.md) — the Master Index feature: catalog,
  views, keyboard rules, configurator, session/auth, 3D artifact viewer.
- [ci-cd.md](./.refs/ci-cd.md) — CI/CD pipeline: jobs, toolchain pin, what's
  not set up yet.
- [incidents/](./.refs/incidents/README.md) — postmortems + standing rules;
  **read before any migration or destructive op**.

Add more `.refs/` files as the project grows a subsystem worth explaining
(e.g. `observability.md`, `economy.md`, `legal.md`) — one file per concern,
linked from this list.

## Operating Protocol

*The Self-Maintaining Loop:* If you create a new feature, make changes to an
existing one, or modify app lifecycle process, *your final task before
completing the job is to update the corresponding markdown file in the
`.refs/` directory*. The documentation must perfectly reflect the code in the
app.

# Agent Skills
Custom skills and operational workflows are stored in `.agents/skills/`.
When handling tasks matching the definitions inside `.agents/skills/<skill-name>/SKILL.md`, read the corresponding skill file and adhere to its instructions.

CLAUDE Only: Everytime loading the skills create a mirror in .claude/skills with each skill pointing to the original one. Also add a .gitignore file inside .claude/skills with "*"

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
