# Archive Index

The home route (`/`) is the **Master Index**: a catalog of coins, banknotes,
phonecards and stamps with a list view, an artifact grid, a hover preview, a
detail drawer with a 3D viewer, and a texture/mesh configurator.

Implemented from the Claude Design project `Archive Index.dc.html` (plus the
`Artifact.dc.html` component it imports). The design's template runtime
(`support.js`, `sc-if`/`sc-for`/`dc-import`) is not used; everything was
rewritten as React + Tailwind.

## Files

- `features/archive/catalog.ts` — `CatalogItem` discriminated union (one
  variant per `ArtifactKind`), the static `CATALOG`, labels, condition
  rank/names, `defaultGeometry(item)`, `itemSubtitle(item)`.
- `features/archive/columns.ts` — per-domain list columns (`COLUMNS`), cell
  type → class map, min table widths, drawer spec rows (`specRows`).
- `features/archive/query.ts` — filter/search/sort (`queryCatalog`) and
  domain counts.
- `features/archive/archive-index.tsx` — client component that owns all
  index state and the keyboard handler. Props mirror the design's tweakables:
  `defaultView`, `rowDensity`, `orbitRpm`, `dwell`.
- `header.tsx`, `list-view.tsx`, `grid-view.tsx`, `hover-preview.tsx`,
  `artifact-caption.tsx`, `silhouette.tsx`, `detail-drawer.tsx` — the views.
- `features/archive/configurator/` — modal (`configurator.tsx`), 2D face
  editor (`face-editor.tsx`), field schema (`schema.ts`), image ingest,
  600 dpi template export, sign-in form.
- `features/archive/config-store.ts` — per-item overrides and
  `artifactProps(item, config)` which maps an item to `<Artifact>` props.
- `features/archive/session.ts` — Server Actions `readSession`, `signIn`,
  `signOut`.
- `components/artifact/` — the reusable 3D `Artifact` viewer (see below).

## Behavior rules

- **Search** matches id, title, origin, ISO, year, kind label, condition and
  the kind's currency/mint/issuer/series fields, case-insensitive.
- **Sort**: clicking the active sort flips direction; a new sort resets to
  ascending. Ties always fall back to catalog id. `origin` sorts by ISO code;
  `cond` sorts by `CONDITION_RANK` (best grade first).
- **List columns** change per domain tab. Column headers with a sort key are
  buttons and show the arrow.
- **Hover preview** appears after `dwell` ms (default 300) and is suppressed
  while the drawer is open. Any scroll (capture phase) hides it. It flips to
  the cursor's left when it would overflow the viewport.
- **Drawer keyboard** (only while open and the configurator is closed):
  `Esc` close, `E` configure, arrows prev/next (wrap around the *filtered*
  list), `F` flip, `Space` pause/resume orbit. Keys are ignored while focus
  is in an input, except `Esc`.
- **Zoom**: buttons step ±0.2, wheel steps ±0.1 per 40px of delta, clamped
  to 0.6–2.4.
- **Configurator** edits a deep-cloned draft; nothing touches the store until
  Save. `Esc` closes the sign-in form first, then the modal. Revert reloads
  the saved config; Catalog defaults resets only the mesh, not images/fit.
  Uploaded images are downscaled to 1400px on the long edge and stored as
  WebP (PNG/JPEG fallback) data URLs.

## Persistence and auth

Overrides are stored in `localStorage` under `aci.store.v1` (same key as the
design), keyed by catalog id. This is per-browser only; the design's planned
`PUT /api/artifacts/:id` endpoint does not exist yet.

Saving or deleting a config requires a session. The design checked a
hard-coded SHA-256 of `user:password` in the browser and stored the hash in
`sessionStorage`; that was **not** carried over because anyone could read the
hash from the bundle and forge the session. Instead:

- `signIn` compares against `ARCHIVE_USER` / `ARCHIVE_PASSWORD` with
  `timingSafeEqual` and sets an `httpOnly`, `sameSite=strict` cookie
  `aci.session` holding an HMAC of the user under `ARCHIVE_SESSION_SECRET`
  (8 h max age, `secure` in production).
- `readSession` recomputes the HMAC and compares. The page stays static;
  the client calls `readSession` on mount.
- If any of the three env vars is missing, sign-in always fails.

See `.env.example`. Since storage is still local, the session only gates the
UI; it becomes a real write guard once the API endpoint exists.

## Artifact viewer (`components/artifact/`)

A CSS-3D rig (no WebGL). `artifact.tsx` owns motion; `coin.tsx`,
`note.tsx`, `card.tsx`, `stamp.tsx` build the meshes; `surfaces.tsx` holds
shared face layers (sheen, clay grid, image). Geometry is in millimetres and
scaled into a 240px rig.

- **Modes**: `static`; `tilt` (pointer-follow, spring 170/13, ±12°);
  `orbit` (auto-rotate at `rpm`, drag to rotate with X clamped ±70°, wheel
  calls `onZoom`, spring-animated flip and zoom).
- Motion runs in a single `requestAnimationFrame` loop that stops when
  settled; props are read through a ref so the loop never re-subscribes.
  Changing `resetKey` zeroes orbit/drag and snaps the flip.
- Face variants per side: uploaded image → textured "scan" placeholder (when
  the item has `tex`) → untextured clay.
- `fit` sets the scale divisor: the rig scales to
  `min(width, height) / fit`.
- Banknotes are 11 strips bent along a parabola (`curve` mm). Stamps use a
  CSS mask for die-cut perforation; the same mask math
  (`perforationGrid`/`perforationMask` in `geometry.ts`) drives the
  configurator preview and the PNG template so all three agree.
