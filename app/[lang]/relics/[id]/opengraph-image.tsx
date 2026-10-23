import { ImageResponse } from "next/og";
import sharp from "sharp";
import type { ArtifactKind } from "../../../../components/artifact/types";
import {
  type CatalogItem,
  itemSubtitle,
  itemYear,
} from "../../../../features/archive/catalog";
import {
  loadCatalog,
  loadCatalogItem,
  readRelicAsset,
} from "../../../../features/archive/relic/load-catalog";
import { dictionaryFor } from "../../../../i18n/dictionary";
import { DEFAULT_LOCALE, hasLocale } from "../../../../i18n/locales";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const OG_FACE_SIZE = 840;

const PAPER = "#f5f4f0";
const SURFACE = "#ecebe6";
const LINE = "#dfded8";
const INK = "#161615";
const MUTED = "#6e6d6a";
const FAINT = "#a8a7a2";

const SILHOUETTE: Record<
  ArtifactKind,
  { width: number; height: number; radius: number }
> = {
  coin: { width: 300, height: 300, radius: 150 },
  note: { width: 420, height: 213, radius: 4 },
  card: { width: 380, height: 240, radius: 14 },
  stamp: { width: 250, height: 300, radius: 2 },
};

export async function generateStaticParams() {
  const catalog = await loadCatalog();
  return catalog.map((item) => ({ id: item.id }));
}

async function faceImage(item: CatalogItem) {
  const side = item.faces.obv ? "obv" : item.faces.rev ? "rev" : null;
  const asset = side ? await readRelicAsset(item.id, side) : null;
  if (!asset) return null;
  const png = await sharp(asset.bytes)
    .resize(OG_FACE_SIZE, OG_FACE_SIZE, { fit: "inside" })
    .png()
    .toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

function Silhouette({ kind }: { kind: ArtifactKind }) {
  const shape = SILHOUETTE[kind];
  return (
    <div
      style={{
        width: shape.width,
        height: shape.height,
        borderRadius: shape.radius,
        background: MUTED,
        opacity: 0.85,
      }}
    />
  );
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
  const image = await faceImage(item);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: PAPER,
        color: INK,
        padding: 56,
        gap: 56,
      }}
    >
      <div
        style={{
          width: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: SURFACE,
          borderRadius: 6,
          padding: 40,
        }}
      >
        {image ? (
          <img
            src={image}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          <Silhouette kind={item.kind} />
        )}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: MUTED,
          }}
        >
          {`${dict.kind[item.kind]} · ${item.origin} · ${itemYear(item)}`}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 64,
            lineHeight: 1.08,
            letterSpacing: -1.5,
          }}
        >
          {item.title}
        </div>
        <div
          style={{ display: "flex", marginTop: 24, fontSize: 28, color: MUTED }}
        >
          {itemSubtitle(item)}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "auto",
            paddingTop: 24,
            borderTop: `1px solid ${LINE}`,
            justifyContent: "space-between",
            fontSize: 24,
          }}
        >
          <span>{item.id}</span>
          <span style={{ color: FAINT }}>{dict.site.name}</span>
        </div>
      </div>
    </div>,
    size,
  );
}
