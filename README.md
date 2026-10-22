# harness-driven-repo

Starter scaffold for a project where AI coding agents (Claude Code and
compatible tools) do most of the day-to-day authoring. It sets up a
self-maintaining documentation loop: agents write code, and the same task
requires them to update the doc that explains it — so `.refs/` never drifts
far from the code it describes.

Extracted from a real project's `AGENTS.md`/`.agents/`/`.refs/`
setup; genericized so it drops into any stack.

## What's in here

- **`AGENTS.md`** — the single entry point for every agent (no separate
  `CLAUDE.md`): a map of `.refs/`, the Operating Protocol (the
  self-maintaining loop rule itself), and where skills live.
- **`.claude/skills/`** — generated, gitignored mirror for Claude Code:
  each entry links back to `.agents/skills/<name>`, recreated by Claude
  whenever it loads skills (per `AGENTS.md`).
- **`.agents/skills/commit/SKILL.md`** — an example skill: encodes this
  project's commit conventions (Conventional Commits, atomic, title-only)
  so an agent doesn't have to be told the rules every session.
- **`.refs/`** — the living documentation set:
  - `conventions.md` — hard authoring rules (no code comments; docs go in
    `.refs/` instead; reusable-component discipline).
  - `architecture.md` — a filled-in-as-you-go template for the system's
    shape: layout, extension points, shared state, design system.
  - `ci-cd.md` — a filled-in-as-you-go template for the CI/CD pipeline.
  - `incidents/` — postmortem log with a starting set of standing rules and
    a `TEMPLATE.md` for new entries.

## Setup

1. Copy this whole tree into a new or existing repo root.
2. Fill in `.refs/architecture.md` and `.refs/ci-cd.md` — every bracketed
   `[...]` is a real decision this project needs to make once, not
   boilerplate to leave in place.
3. Adjust `.agents/skills/commit/SKILL.md`'s type rules and scopes if this
   project's conventions differ.
4. Add project-specific `.refs/` files as real subsystems appear (e.g. an
   economy/billing system, an observability rollout, a compliance doc) and
   link each one from `AGENTS.md`'s list.
5. Delete this README's setup section once done, or leave it — it costs an
   agent nothing to skip a section that's already satisfied.

## Why this shape

- **One file agents always read first** (`AGENTS.md`), instead of docs
  scattered and undiscoverable.
- **Docs next to a binding rule to update them**, not a wiki that rots the
  moment nobody's assigned to it — the Operating Protocol makes "update the
  ref" part of the task definition, not a follow-up.
- **No comments in code** pushes explanation into `.refs/`, where it's
  findable by concern instead of buried at the line that happened to need
  it.
- **Incidents are logged, not just fixed** — the standing rules earned from
  a past bug are cheap insurance against repeating the same wrong turn.
