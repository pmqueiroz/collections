import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cacheTag } from "next/cache";
import type { FaceSide } from "../../../components/artifact/types";
import type { CatalogItem } from "../catalog";
import { parseCatalogEntry } from "./manifest";
import { decodeRelic, RELIC_EXTENSION, type RelicAsset } from "./relic-file";

export const RELIC_DIR = path.join(process.cwd(), "relics");
export const RELIC_CACHE_TAG = "relics";

export async function readRelic(name: string) {
  const file = await readFile(path.join(RELIC_DIR, name));
  try {
    return decodeRelic(new Uint8Array(file));
  } catch (error) {
    throw new Error(`relics/${name}: ${(error as Error).message}`);
  }
}

export async function loadCatalog(): Promise<CatalogItem[]> {
  "use cache";
  cacheTag(RELIC_CACHE_TAG);
  const names = (await readdir(RELIC_DIR)).filter((name) =>
    name.endsWith(RELIC_EXTENSION),
  );
  const items = await Promise.all(
    names.map(async (name) => {
      const contents = await readRelic(name);
      try {
        return parseCatalogEntry(contents);
      } catch (error) {
        throw new Error(`relics/${name}: ${(error as Error).message}`);
      }
    }),
  );
  return items.sort((a, b) => a.id.localeCompare(b.id));
}

export async function loadCatalogItem(id: string) {
  const items = await loadCatalog();
  return items.find((item) => item.id === id) ?? null;
}

export async function readRelicAsset(
  id: string,
  face: FaceSide,
): Promise<RelicAsset | null> {
  "use cache";
  cacheTag(RELIC_CACHE_TAG);
  const items = await loadCatalog();
  if (!items.some((item) => item.id === id)) return null;
  const { assets } = await readRelic(`${id}${RELIC_EXTENSION}`);
  return assets[face] ?? null;
}
