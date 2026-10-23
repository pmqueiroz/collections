import { cacheTag } from "next/cache";
import type { ArtifactKind } from "../../../components/artifact/types";
import { type CatalogItem, KINDS } from "../catalog";
import { RELIC_CACHE_TAG, readRelic } from "../relic/load-catalog";
import { RELIC_EXTENSION, type RelicAsset } from "../relic/relic-file";
import { textureFromRelic } from "../texture-editor/texture-file";

const TRAILING_NUMBER = /^(.*?)(\d+)$/;

const FIRST_IDS: Record<ArtifactKind, string> = {
  coin: "NUM-C-0001",
  note: "NUM-B-0001",
  card: "TEL-C-0001",
  stamp: "PHI-S-0001",
};

function base64DataUrl(asset: RelicAsset) {
  return `data:${asset.type};base64,${Buffer.from(asset.bytes).toString("base64")}`;
}

export async function loadRelicDraft(id: string) {
  "use cache";
  cacheTag(RELIC_CACHE_TAG);
  return textureFromRelic(
    await readRelic(`${id}${RELIC_EXTENSION}`),
    base64DataUrl,
  );
}

function nextId(ids: string[], first: string) {
  const numbered = ids
    .map((id) => TRAILING_NUMBER.exec(id))
    .filter((match) => match !== null);
  const last = numbered.at(-1);
  if (!last) return first;
  const [, prefix, digits] = last;
  const highest = Math.max(
    ...numbered
      .filter((match) => match[1] === prefix)
      .map((match) => Number(match[2])),
  );
  return `${prefix}${String(highest + 1).padStart(digits.length, "0")}`;
}

export function nextIds(catalog: CatalogItem[]) {
  return Object.fromEntries(
    KINDS.map((kind) => [
      kind,
      nextId(
        catalog.filter((item) => item.kind === kind).map((item) => item.id),
        FIRST_IDS[kind],
      ),
    ]),
  ) as Record<ArtifactKind, string>;
}
