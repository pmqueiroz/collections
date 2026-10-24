import { ImageResponse } from "next/og";
import type { ArtifactKind } from "../../../../components/artifact/types";
import { Lockup } from "../../../../components/brand/lockup";
import { PALETTE } from "../../../../components/brand/palette";
import {
  type SpecLabel,
  specEntries,
} from "../../../../features/archive/columns";
import { Face, faceImage } from "../../../../features/archive/og/face";
import {
  loadCatalog,
  loadCatalogItem,
} from "../../../../features/archive/relic/load-catalog";
import {
  loadOgFonts,
  OG_MONO,
  OG_SANS,
} from "../../../../features/brand/og-fonts";
import { dictionaryFor } from "../../../../i18n/dictionary";
import { DEFAULT_LOCALE, hasLocale } from "../../../../i18n/locales";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const OG_FACE_SIZE = 840;

const SHARE_ROWS: Record<ArtifactKind, SpecLabel[]> = {
  coin: ["origin", "mintYear", "metal", "cond"],
  note: ["origin", "issueYear", "printer", "cond"],
  card: ["origin", "issueYear", "issuer", "cond"],
  stamp: ["origin", "issueYear", "printing", "cond"],
};

export async function generateStaticParams() {
  const catalog = await loadCatalog();
  return catalog.map((item) => ({ id: item.id }));
}

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = dictionaryFor(hasLocale(lang) ? lang : DEFAULT_LOCALE);
  return [{ id: "card", alt: dict.site.relicAlt, size, contentType }];
}

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const item = await loadCatalogItem(id);
  if (!item || !hasLocale(lang)) return new Response(null, { status: 404 });
  const dict = dictionaryFor(lang);
  const [image, fonts] = await Promise.all([
    faceImage(item, OG_FACE_SIZE),
    loadOgFonts(),
  ]);
  const entries = new Map(specEntries(item, dict));
  const rows = SHARE_ROWS[item.kind].map((label) => ({
    label: dict.spec[label],
    value: entries.get(label) ?? "—",
  }));

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: PALETTE.paper,
        color: PALETTE.ink,
        fontFamily: OG_SANS,
      }}
    >
      <div
        style={{
          position: "relative",
          width: 560,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 64,
          background: PALETTE.tray,
          borderRight: `1px solid ${PALETTE.rule}`,
        }}
      >
        <Face image={image} kind={item.kind} />
        <div
          style={{
            position: "absolute",
            left: 32,
            top: 28,
            fontFamily: OG_MONO,
            fontSize: 15,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            color: PALETTE.graphite,
          }}
        >
          {dict.kind[item.kind]}
        </div>
      </div>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          padding: "56px 64px 52px",
        }}
      >
        <div
          style={{ fontFamily: OG_MONO, fontSize: 24, color: PALETTE.graphite }}
        >
          {item.id}
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 72,
            fontWeight: 500,
            letterSpacing: -3.24,
            lineHeight: 1,
          }}
        >
          {item.title}
        </div>
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            borderTop: `1px solid ${PALETTE.rule}`,
          }}
        >
          {rows.map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 16,
                padding: "11px 0",
                borderBottom: `1px solid ${PALETTE.rule}`,
                fontFamily: OG_MONO,
              }}
            >
              <div
                style={{
                  width: 180,
                  flex: "none",
                  fontSize: 15,
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                  color: PALETTE.graphite,
                }}
              >
                {row.label}
              </div>
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 22,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {row.value}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", marginTop: 28 }}>
          <Lockup name={dict.site.name} size={28} />
        </div>
      </div>
    </div>,
    { ...size, fonts },
  );
}
