import { DEFAULT_FIT } from "../../../components/artifact/geometry";
import type { ArtifactKind } from "../../../components/artifact/types";
import { type ArtifactConfig, blankConfig } from "../artifact-config";
import { KINDS, kindGeometry } from "../catalog";

export type TextureDraft = ArtifactConfig & { kind: ArtifactKind };

const FORMAT = "aci.texture";
const VERSION = 1;

export function blankTexture(kind: ArtifactKind): TextureDraft {
  return { kind, ...blankConfig(kindGeometry(kind)) };
}

export function textureFileName(draft: TextureDraft) {
  return `${draft.kind}-texture.json`;
}

export function downloadTexture(draft: TextureDraft) {
  const file = JSON.stringify(
    { format: FORMAT, version: VERSION, ...draft },
    null,
    2,
  );
  const url = URL.createObjectURL(
    new Blob([file], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = textureFileName(draft);
  link.click();
  URL.revokeObjectURL(url);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function mergeTyped<T extends Record<string, unknown>>(
  base: T,
  value: unknown,
): T {
  if (!isRecord(value)) return base;
  const merged: Record<string, unknown> = { ...base };
  for (const key of Object.keys(merged))
    if (typeof value[key] === typeof merged[key]) merged[key] = value[key];
  return merged as T;
}

function imageUrl(value: unknown) {
  return typeof value === "string" && value.startsWith("data:image/")
    ? value
    : "";
}

export function parseTexture(text: string): TextureDraft | null {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (!isRecord(data) || data.format !== FORMAT) return null;
  const kind = KINDS.find((option) => option === data.kind);
  if (!kind) return null;
  return {
    kind,
    geo: mergeTyped(kindGeometry(kind), data.geo),
    obv: imageUrl(data.obv),
    rev: imageUrl(data.rev),
    fo: mergeTyped(DEFAULT_FIT, data.fo),
    fr: mergeTyped(DEFAULT_FIT, data.fr),
  };
}
