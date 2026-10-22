# Archive Index

The home route (`/`) is the **Master Index**: a catalog of coins, banknotes,
phonecards and stamps with a list view, an artifact grid, a hover preview, a
detail drawer with a 3D viewer, and a texture editor that exports texture
files.

Implemented from the Claude Design project `Archive Index.dc.html` (plus the
`Artifact.dc.html` component it imports). The design's template runtime
(`support.js`, `sc-if`/`sc-for`/`dc-import`) is not used; everything was
rewritten as React + Tailwind.

## Files

- `features/archive/catalog.ts` — `CatalogItem` discriminated union (one
  variant per `ArtifactKind`; every item carries `model` and `faces` from
  its relic), labels, condition rank/names, `KINDS`, `kindGeometry(kind)`
  (per-kind base mesh), `itemSubtitle(item)`. The data itself lives in
  `relics/*.relic`, see [relic.md](./relic.md).
- `features/archive/relic/` — `.relic` codec (`relic-file.ts`), manifest
  validation (`manifest.ts`), server loader (`load-catalog.ts`).
  `app/page.tsx` awaits `loadCatalog()` and passes `catalog` to
  `ArchiveIndex`; `app/relics/[id]/[face]/route.ts` serves textures.
- `features/archive/columns.ts` — per-domain list columns (`COLUMNS`), cell
  type → class map, min table widths, drawer spec rows (`specRows`).
- `features/archive/query.ts` — filter/search/sort (`queryCatalog`) and
  domain counts, both taking the catalog list as their first argument.
- `features/archive/archive-index.tsx` — client component that owns all
  index state (including the texture editor draft) and the keyboard
  handler. Props mirror the design's tweakables:
  `defaultView`, `rowDensity`, `orbitRpm`, `dwell`.
- `features/archive/use-relic-link.ts` — `useRelicLink`, keeps the open
  detail in the URL (see **Share links** below).
- `header.tsx`, `list-view.tsx`, `grid-view.tsx`, `hover-preview.tsx`,
  `artifact-caption.tsx`, `silhouette.tsx`, `detail-drawer.tsx` — the views.
- `compact-header.tsx`, `domain-tab-bar.tsx`, `domain-glyph.tsx` — phone-only
  chrome (see [Mobile](#mobile-compact-layout)).
- `features/archive/texture-editor/` — modal (`texture-editor.tsx`), 2D
  face editor (`face-editor.tsx`), field schema (`schema.ts`), image
  ingest, 600 dpi template export, relic open/download (`texture-file.ts`).
- `features/archive/artifact-config.ts` — `ArtifactModel` (mesh, fits),
  `ArtifactConfig` (model + face images), `blankConfig(geo)`,
  `relicAssetUrl(id, face)`, and `artifactProps(item, config?)` which maps
  an item to `<Artifact>` props (the item's relic model and texture URLs
  when no config is given).
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
- **Drawer keyboard** (only while open and the texture editor is closed):
  `Esc` close, arrows prev/next (wrap around the *filtered* list), `F`
  flip, `Space` pause/resume orbit. Keys are ignored while focus is in an
  input, except `Esc`.
- **Share links**: the open detail is mirrored in the URL as
  `/?relic=<id>`, so the address bar is a shareable link. Opening, stepping
  prev/next and closing all use `history.replaceState` (no history entries,
  Back leaves the page rather than walking relics). On mount the param is
  read from `window.location` and, if it names a catalog id, that relic
  opens as if clicked; an unknown id is stripped. The param is read client
  side (not via `searchParams` / `useSearchParams`) so `/` stays a static
  prerender; the cost is that a shared link paints the index first and the
  drawer slides in after hydration. Only the relic id is shared: side,
  zoom, domain, search and sort are not.
- **Zoom**: buttons step ±0.2, wheel steps ±0.1 per 40px of delta, clamped
  to 0.6–2.4.
- **Texture editor** is opened from the header ("Texture editor" on
  desktop, "Editor" on phones), not from an item. See
  [Texture editor](#texture-editor).

## Mobile (compact layout)

Below 720px the index switches to an iOS-style layout taken from the same
design file (`isCompact` there). The breakpoint is the Tailwind
`regular:` variant (`--breakpoint-regular: 720px` in `globals.css`); the
texture editor also uses `split:` (900px) to decide one vs two columns.

How it is split between CSS and JS:

- **Static chrome is CSS-only** so the prerendered page is right on first
  paint: `Header` is `hidden regular:block`, `CompactHeader` is
  `regular:hidden`, `ListView` renders both the table and the compact row
  list and hides one, the grid/empty state use responsive classes, and the
  tab bar is `regular:hidden`.
- **Behavior uses `useMediaQuery`** (`components/ui/use-media-query.ts`,
  `useSyncExternalStore` over `matchMedia`, server snapshot `false`).
  `ArchiveIndex` reads `COMPACT_QUERY` and `FINE_HOVER_QUERY` and passes
  `compact` to `DetailDrawer` and `TextureEditor`. Those two are closed on
  first paint, so the server value never shows.

Compact behavior:

- **Header**: large domain title (`domainTitle`: "Index" for All) + count,
  List/Grid toggle, an "Editor" button for the texture editor, 16px search input (no iOS focus zoom), a native
  `<select>` overlaid invisibly on the Sort label, and a direction toggle.
  Picking a sort from the select resets direction to ascending.
- **Bottom tab bar** replaces the domain tabs. Tapping the active domain
  scrolls to top. Lists get bottom padding of tab-bar height + safe area.
- **List** rows are 64px tap targets (silhouette tile, id, title,
  subtitle, chevron). **Grid** is two columns with `static` artifacts (no
  tilt on touch).
- **Hover preview** never shows when compact or when the device lacks
  `(hover: hover) and (pointer: fine)`.
- **Detail** is a full-width pushed page: the index shifts left 28% under
  it, header has a back button labelled with the domain title, the viewer
  controls become 40px tiles, and a footer
  holds Prev / position / Next. Swiping right from the left 18px edge drags
  the page; releasing past 30% width or 140px dismisses it. The aside is
  `touch-pan-y` so horizontal moves reach the pointer handlers.
- **Texture editor** is a bottom sheet (12px top radius, enters from below
  via `starting:`), Close / Download in the sheet header with the kind
  picker under it, scrim tap closes. Range rows grow to 48px with 16px
  number inputs; footer buttons use `size="adaptive"`. The face editor
  measures its section and caps the template at `width - 76px` so it fits
  narrow screens.
- **Safe areas**: `viewport-fit=cover` is set in `app/layout.tsx`; headers
  use `pt-safe`, the tab bar, drawer footer and sheet footer use `pb-safe`.

Entry animations use Tailwind `starting:` (`@starting-style`), so the
texture editor animates in but not out (it unmounts on close).

## Texture editor

Textures live in the repo as `.relic` files (see [relic.md](./relic.md)),
so the editor does not save anything locally. It opens a relic, edits its
mesh and faces, and downloads the result as a `.relic` to commit.

- **Kind picker** (Coin / Banknote / Phonecard / Stamp) sits in the modal
  header. Switching kind resets the mesh to `kindGeometry(kind)` and keeps
  both face images and fits. The picker is **disabled** while the draft
  belongs to a catalog entry (`meta.id` set), because that entry's `specs`
  only fit its own kind.
- **Draft** lives in `ArchiveIndex` state, not in the modal, so closing
  the editor (`Esc`, Close, scrim) and reopening keeps the work. It is lost
  on page reload. Starts as `blankTexture("coin")`. `TextureDraft` is
  `ArtifactConfig` + `kind` + `meta` (every manifest field except `kind`,
  `model` and `assets`, carried through untouched).
- **Faces**: per side upload / drag-drop an image, pan by dragging, scale
  by wheel, or use the Fit sliders. Images are downscaled to 1400px on the
  long edge and kept as WebP (PNG/JPEG fallback) data URLs. The image keeps
  its own aspect ratio, so a scan holding both sides can be panned to one
  half per face (see **Face images** under [Artifact viewer](#artifact-viewer-componentsartifact)); uploading that same scan
  to both sides is stored once in the relic. "Template ↓"
  exports a 600 dpi PNG print/scan template for the current side and mesh.
- **Mesh defaults** resets only the mesh; **Clear** resets the whole draft
  for the current kind, `meta` included (detaches it from its entry).
- **Open…** reads a `.relic`: asset bytes become in-memory data URLs so the
  face editor and template export work unchanged. Decode errors show in the
  status bar as `<file> · <reason>`.
- **Download** writes `<id>.relic` (or `<kind>.relic` for a blank draft):
  data URLs go back to raw bytes, manifest is `meta` + `kind` + `model`.
- The preview renders the draft untextured (`textured={false}`), so faces
  without an image show clay instead of the catalog "scan" placeholder.

There is no auth. The cookie session that gated local saves was removed
with local storage; add a real write guard when an upload endpoint exists.

## Artifact viewer (`components/artifact/`)

A CSS-3D rig (no WebGL). `artifact.tsx` owns motion; `coin.tsx`,
`note.tsx`, `card.tsx`, `stamp.tsx` build the meshes; `surfaces.tsx` holds
shared face layers (sheen, clay grid, image). Geometry is in millimetres and
scaled into a 240px rig.

- **Modes**: `static`; `tilt` (pointer-follow, spring 170/13, ±12°);
  `orbit` (auto-rotate at `rpm`, drag to rotate with X clamped ±70°, wheel
  calls `onZoom`, two-finger pinch calls `onZoom(±1)` each time the finger
  span changes by ~10%, spring-animated flip and zoom).
- Motion runs in a single `requestAnimationFrame` loop that stops when
  settled; props are read through a ref so the loop never re-subscribes.
  Changing `resetKey` zeroes orbit/drag and snaps the flip.
- Face variants per side: uploaded image → textured "scan" placeholder (when
  the item has `tex`) → untextured clay.
- **Face images** (`FittedImage` in `surfaces.tsx`, also used by the
  texture editor's face editor): a face-sized wrapper carries the
  `fitTransform` (translate % of the face, rotate, scale), and the image
  inside it is sized to *cover* the face at its natural aspect ratio but is
  not clipped by `object-fit`. Only the face's own `overflow-hidden`
  clips, so pan/scale can reach any part of the image (e.g. one coin of a
  side-by-side scan). Sizing uses container query units
  (`container-type: size` on the wrapper) and the natural aspect read in
  `onLoad`; until it loads the image falls back to plain `object-cover`.
  Fit offsets range ±200%. At the image's default fit, a face whose image
  matches the face aspect renders exactly as before.
- `fit` sets the scale divisor: the rig scales to
  `min(width, height) / fit`.
- Banknotes are 11 strips bent along a parabola (`curve` mm). Stamps use a
  CSS mask for die-cut perforation; the same mask math
  (`perforationGrid`/`perforationMask` in `geometry.ts`) drives the
  texture editor preview and the PNG template so all three agree.
