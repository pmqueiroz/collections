# Brand

Source: Claude Design project, `Relics Brand.dc.html`. The name is
**Relics**, the same in every locale (`site.name`, see [i18n.md](./i18n.md)).

## Mark

A specimen in its tray: an ink square (the archive) holding a paper disc
(the object). `components/brand/mark.tsx` is the only implementation; never
redraw it by hand.

- Geometry is a function of size (`markGeometry`): corner radius
  `max(2, round(size × 0.11))`, disc diameter `size / 2`, centred (inset
  `size / 4`).
- Tones: `ink` (ink tray, paper disc) for paper and tray grounds;
  `reversed` only on full-ink grounds.
- Sizes from the sheet: 96 app icon, 32 favicon, 22 mobile, 16 minimum.
- Styled with inline styles only, so the same component renders in the app
  and inside Satori (OG images), which cannot read Tailwind classes or CSS
  vars.

## Wordmark and lockup

`components/brand/lockup.tsx`: mark at the text size, then "Relics" in Geist
Semibold, title case, never all caps. Tracking −4.5% at UI sizes, −6% from
56px up (`wordmarkTracking`, computed in px because Satori does not take
`em` tracking). Gap scales with size (10px at 16). Used by the desktop
header (16px, inside the `<h1>`) and both OG cards (44px index, 28px relic).
The phone `CompactHeader` shows the domain title instead, no lockup.

## Palette

Archival neutrals only; the objects carry the colour. Tailwind tokens in
`app/globals.css`, mirrored as hex in `components/brand/palette.ts` for
Satori:

| Sheet name | Hex       | Tailwind token | Use        |
| ---------- | --------- | -------------- | ---------- |
| Ink        | `#161615` | `ink`          | text, mark |
| Paper      | `#F5F4F0` | `paper`        | ground     |
| Tray       | `#ECEBE6` | `surface`      | surfaces   |
| Rule       | `#DFDED8` | `line`         | lines      |
| Graphite   | `#6E6D6A` | `muted`        | secondary  |
| Dust       | `#A8A7A2` | `faint`        | tertiary   |

Change a colour in both files.

## Type

Geist for names and prose, Geist Mono for anything measured, coded or
counted (IDs, dimensions, years, counts, labels). The app loads both through
`next/font`. OG images cannot, so Geist 500/600 and Geist Mono 400/500 TTFs
are vendored in `features/brand/fonts/` (OFL, from Google Fonts; Satori
reads TTF/OTF/WOFF, not WOFF2) and loaded by `loadOgFonts`
(`features/brand/og-fonts.ts`).

## Icons

Generated from the mark formula, committed as files:

- `app/icon.svg` — 32px mark.
- `app/favicon.ico` — 16/32/48 PNGs rendered from per-size SVGs.
- `app/apple-icon.png` — 180px, full-bleed square (no corner radius; iOS
  applies its own mask), disc 90px centred.

To regenerate, build the SVG from `markGeometry` at the target size and
rasterize with `magick -density 384 mark.svg -resize NxN`.

## Voice

Plain, exact, short. No slogans, taglines or exclamations: "No records match
“yen”.", not "Oops! We couldn’t find anything."
