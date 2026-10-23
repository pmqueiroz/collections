import type {
  ArtifactKind,
  FaceSide,
} from "../../../components/artifact/types";
import { type ArtifactConfig, blankConfig } from "../artifact-config";
import { kindGeometry } from "../catalog";
import { parseKind, parseModel } from "../relic/manifest";
import {
  decodeRelic,
  encodeRelic,
  RELIC_EXTENSION,
  RELIC_MIME,
  type RelicAsset,
  type RelicAssets,
  type RelicContents,
} from "../relic/relic-file";

export type TextureDraft = ArtifactConfig & {
  kind: ArtifactKind;
  meta: Record<string, unknown>;
};

const FACES: FaceSide[] = ["obv", "rev"];

export function blankTexture(kind: ArtifactKind): TextureDraft {
  return { kind, meta: {}, ...blankConfig(kindGeometry(kind)) };
}

export function catalogId(draft: TextureDraft) {
  return typeof draft.meta.id === "string" ? draft.meta.id : null;
}

export function textureFileName(draft: TextureDraft) {
  return `${catalogId(draft) ?? draft.kind}${RELIC_EXTENSION}`;
}

async function dataUrlAsset(dataUrl: string): Promise<RelicAsset> {
  const blob = await (await fetch(dataUrl)).blob();
  return { bytes: new Uint8Array(await blob.arrayBuffer()), type: blob.type };
}

function assetDataUrl(asset: RelicAsset) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(new Blob([asset.bytes], { type: asset.type }));
  });
}

export async function encodeTexture(draft: TextureDraft) {
  const assets: RelicAssets = {};
  for (const face of FACES)
    if (draft[face]) assets[face] = await dataUrlAsset(draft[face]);
  return encodeRelic({
    manifest: {
      ...draft.meta,
      kind: draft.kind,
      model: { geo: draft.geo, fo: draft.fo, fr: draft.fr },
    },
    assets,
  });
}

export async function downloadTexture(draft: TextureDraft) {
  const file = await encodeTexture(draft);
  const url = URL.createObjectURL(new Blob([file], { type: RELIC_MIME }));
  const link = document.createElement("a");
  link.href = url;
  link.download = textureFileName(draft);
  link.click();
  URL.revokeObjectURL(url);
}

export async function textureFromRelic(
  { manifest, assets }: RelicContents,
  toDataUrl: (asset: RelicAsset) => string | Promise<string>,
): Promise<TextureDraft> {
  const kind = parseKind(manifest.kind);
  if (!kind) throw new Error("unknown kind");
  const { kind: _kind, model, ...meta } = manifest;
  return {
    kind,
    meta,
    ...parseModel(kind, model),
    obv: assets.obv ? await toDataUrl(assets.obv) : "",
    rev: assets.rev ? await toDataUrl(assets.rev) : "",
  };
}

export async function openTexture(file: File): Promise<TextureDraft> {
  return textureFromRelic(
    decodeRelic(new Uint8Array(await file.arrayBuffer())),
    assetDataUrl,
  );
}
