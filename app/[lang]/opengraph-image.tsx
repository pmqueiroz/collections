import { ImageResponse } from "next/og";
import { Lockup } from "../../components/brand/lockup";
import { PALETTE } from "../../components/brand/palette";
import { type CatalogItem, KINDS } from "../../features/archive/catalog";
import { Face, faceImage, hasFaceScan } from "../../features/archive/og/face";
import { loadCatalog } from "../../features/archive/relic/load-catalog";
import { loadOgFonts, OG_MONO, OG_SANS } from "../../features/brand/og-fonts";
import { dictionaryFor } from "../../i18n/dictionary";
import { DEFAULT_LOCALE, hasLocale } from "../../i18n/locales";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TILE_FACE_SIZE = 420;

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = dictionaryFor(hasLocale(lang) ? lang : DEFAULT_LOCALE);
  return [{ id: "card", alt: dict.share.indexAlt, size, contentType }];
}

function yearSpan(catalog: CatalogItem[]) {
  const years = catalog
    .map((item) => item.year)
    .filter((year): year is number => year !== null);
  if (years.length === 0) return null;
  const first = Math.min(...years);
  const last = Math.max(...years);
  return first === last ? String(first) : `${first}–${last}`;
}

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) return new Response(null, { status: 404 });
  const dict = dictionaryFor(lang);
  const [catalog, fonts] = await Promise.all([loadCatalog(), loadOgFonts()]);
  const tiles = await Promise.all(
    KINDS.map(async (kind) => {
      const items = catalog.filter((item) => item.kind === kind);
      const featured = items.find(hasFaceScan);
      return {
        kind,
        count: items.length,
        label: `${dict.domain[kind]} · ${items.length}`,
        image: featured ? await faceImage(featured, TILE_FACE_SIZE) : null,
      };
    }),
  );
  const stats = [
    dict.share.records(catalog.length),
    dict.share.domains(tiles.filter((tile) => tile.count > 0).length),
    yearSpan(catalog),
  ].filter((stat): stat is string => stat !== null);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        gap: 56,
        padding: "64px 72px",
        background: PALETTE.paper,
        color: PALETTE.ink,
        fontFamily: OG_SANS,
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Lockup name={dict.site.name} size={44} />
        <div
          style={{
            fontSize: 64,
            fontWeight: 500,
            letterSpacing: -2.88,
            lineHeight: 1.02,
          }}
        >
          {KINDS.map((kind) => dict.domain[kind]).join(", ")}
        </div>
        <div
          style={{
            display: "flex",
            gap: 28,
            fontFamily: OG_MONO,
            fontSize: 22,
            color: PALETTE.graphite,
          }}
        >
          {stats.map((stat) => (
            <div key={stat}>{stat}</div>
          ))}
        </div>
      </div>
      <div
        style={{
          width: 440,
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        {tiles.map((tile) => (
          <div
            key={tile.kind}
            style={{
              width: 215,
              height: 246,
              display: "flex",
              flexDirection: "column",
              background: PALETTE.tray,
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 22,
              }}
            >
              <Face image={tile.image} kind={tile.kind} scale={0.4} />
            </div>
            <div
              style={{
                padding: "0 14px 12px",
                fontFamily: OG_MONO,
                fontSize: 15,
                color: PALETTE.graphite,
              }}
            >
              {tile.label}
            </div>
          </div>
        ))}
      </div>
    </div>,
    { ...size, fonts },
  );
}
