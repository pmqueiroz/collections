# Relic Archival Container (`.relic`)

Every catalog entry is one `.relic` file in repo-root `relics/`
(`relics/<id>.relic`). The format is a chunked binary container modelled on
`.glb`: a JSON manifest chunk followed by a binary buffer chunk. Images are
stored as raw bytes, so there is none of the ~33% Base64 bloat the old
`aci.texture` JSON had, and one file still carries everything about an
artifact.

- Extension: `.relic`
- MIME: `application/vnd.relic+binary`
- Codec: `features/archive/relic/relic-file.ts` (isomorphic, no Node or DOM
  APIs; used by the server loader and the texture editor).

## Layout

All integers are **little-endian** (same as glb, and what `DataView` reads
cheaply on every platform we target).

| Offset | Size | Type | Field | Rule |
|---|---|---|---|---|
| `0x00` | 4 B | `char[4]` | magic | ASCII `RLIC` (`52 4C 49 43`) |
| `0x04` | 2 B | `u16` | version | `1`. Anything else is rejected. |
| `0x06` | 2 B | `u16` | flags | see below |
| `0x08` | 4 B | `u32` | meta_len | byte length of META, padding included, multiple of 4 |
| `0x0C` | 4 B | `u32` | bin_len | byte length of BUFF, padding included, multiple of 4, may be 0 |
| `0x10` | 4 B | `u32` | crc32 | CRC-32 (IEEE, the zlib/PNG one) of bytes `[0x14, 0x14 + meta_len + bin_len)` |
| `0x14` | N B | `u8[]` | META | UTF-8 JSON manifest, right-padded with spaces (`0x20`) |
| `0x14+N` | M B | `u8[]` | BUFF | raw assets, each starting on a 4-byte boundary, zero padding between/after |

The header is 20 bytes, so META starts aligned; padding META to 4 keeps BUFF
aligned too. Space padding keeps META valid JSON (trailing whitespace).

The CRC covers both chunks but not the header: the header fields are already
cross-checked (file length must equal `20 + meta_len + bin_len`), and
excluding the CRC field itself avoids a self-referential checksum.

### Flags

| Bit | Meaning | Status |
|---|---|---|
| `1<<0` | obverse texture present | supported |
| `1<<1` | reverse texture present | supported |
| `1<<2` | custom `.obj` mesh override | **reserved**, files that set it are rejected |
| `1<<3` | Zstd-compressed chunks | **reserved**, files that set it are rejected |

Unknown bits are rejected too. `.obj` is reserved because the viewer is CSS-3D
(no WebGL) and cannot render an arbitrary mesh; zstd because browsers cannot
compress zstd and the editor must be able to write every valid file. Supporting
either is a decoder change; for zstd the spec must first say whether
`meta_len`/`bin_len` and the CRC measure compressed or uncompressed bytes.

## Manifest

```json
{
  "id": "NUM-C-0001",
  "kind": "coin",
  "title": "1 Franc · Semeuse",
  "origin": "France",
  "iso": "FRA",
  "year": 1960,
  "amount": 1,
  "cond": "XF",
  "tex": true,
  "face": "1 F",
  "specs": { "cur": "FRF", "denom": "1", "mint": "Paris", "metal": "Nickel",
             "dia": "24.00", "thk": "1.80", "wt": "6.00", "edge": "Plain" },
  "model": {
    "geo": { "dia": 24, "thk": 1.8, "bevel": 1, "edge": "plain" },
    "fo": { "s": 1, "x": 0, "y": 0, "r": 0 },
    "fr": { "s": 1, "x": 0, "y": 0, "r": 0 }
  },
  "assets": { "obv": { "offset": 0, "length": 18432, "type": "image/webp" } }
}
```

- **Universal** fields sit at the top level (`id` … `face`).
- **`amount`** is how many physical copies of this exact entry (same item,
  same year) the collection holds. Optional positive integer, defaults to
  `1`; anything else fails with `invalid amount`. Duplicates of one year
  are one relic with `amount > 1`, never separate relics.
- **Domain schema** is `specs`; the field list per kind is `SPEC_FIELDS` in
  `features/archive/relic/manifest.ts`. All spec values are display strings.
  The loader flattens `specs` onto the `CatalogItem`, so list columns,
  search and the drawer read them like before.
- **Parametric 3D config** is `model` (`ArtifactModel`: `geo`, `fo`, `fr`).
  `parseModel` merges it over `kindGeometry(kind)` / `DEFAULT_FIT`, keeping
  only known keys with matching value types.
- **Buffer offsets** are `assets.<face>`: `offset` is relative to the start of
  BUFF, must be 4-aligned and in range. `type` must be `image/webp`,
  `image/png` or `image/jpeg` (KTX2 is not accepted: CSS can't display it).
  `encodeRelic` writes `assets` itself; callers never set it.
- **Shared faces**: when `obv` and `rev` carry byte-identical images (one
  scan used for both sides), `encodeRelic` writes the bytes once and both
  entries point at the same `offset`/`length`. Overlapping entries are
  valid; the decoder slices each face independently.
- Flag bits 0/1 must agree with the presence of `assets.obv` / `assets.rev`.

`decodeRelic` throws an `Error` whose message is the reason (`not a relic
file`, `checksum mismatch`, `reserved flag set 0x9`, …). It returns the
manifest without `assets` plus the decoded asset bytes.

## Who reads and writes relics

- **Catalog**: `loadCatalog()` (`features/archive/relic/load-catalog.ts`,
  `'use cache'`) decodes every `relics/*.relic`, validates with the strict
  `parseCatalogEntry`, sorts by id. Any bad file fails the build with
  `relics/<file>: <reason>`. `app/page.tsx` passes the result to
  `ArchiveIndex`.
- **Textures**: `app/relics/[id]/[face]/route.ts` serves an asset slice with
  its MIME type (404 when absent). `generateStaticParams` lists every id ×
  `obv`/`rev`, so all are prerendered. `artifactProps` points `obv`/`rev` at
  `relicAssetUrl(id, face)` when `item.faces[face]` is set, so images never
  travel as Base64 in the page payload.
- **Share page / preview card**: `app/relics/[id]/` (page and
  `opengraph-image.tsx`) uses `loadCatalogItem(id)` and `readRelicAsset`;
  see [archive.md](./archive.md#behavior-rules).
- **Texture editor**: opens and downloads `.relic` (see
  [archive.md](./archive.md#texture-editor)).

## Adding or changing an entry

The original banknote, phonecard and stamp entries were generated once from
the old static `CATALOG` array by a throwaway script (not committed). The
coins (`NUM-C-*`) were imported once from the owner's Google Sheet (read via
`rclone`, columns currency / amount / minting years / ISO / country), again
by a throwaway script: one relic per coin + country + year, duplicate years
folded into `amount`, ids in sheet order then year. The sheet only had those
columns, so every coin has `cond: "VF"`, `tex: false`, the default coin
model, and `"—"` for `mint`, `metal`, `dia`, `thk`, `wt`, `edge`. The sheet's
`UAE` was corrected to ISO `ARE`. Those placeholders are meant to be
corrected per entry.

There is no pack CLI: edit an
entry by opening its relic in the texture editor and downloading it back over
`relics/<id>.relic`. A brand-new entry needs its catalog fields (`id`,
`title`, `specs`, …) in the manifest; the editor preserves but does not edit
them, so a blank editor export is rejected by the loader until they exist.

`.gitattributes` marks `*.relic` as binary.
