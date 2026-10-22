import { DEFAULT_FIT } from "../../components/artifact/geometry";
import type { Fit, Geometry } from "../../components/artifact/types";
import { type CatalogItem, defaultGeometry } from "./catalog";

export type ArtifactConfig = {
  geo: Geometry;
  obv: string;
  rev: string;
  fo: Fit;
  fr: Fit;
};

export type ConfigStore = Record<string, Partial<ArtifactConfig>>;

const STORE_KEY = "aci.store.v1";

export function loadStore(): ConfigStore {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

export function persistStore(store: ConfigStore) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

export function configFor(
  item: CatalogItem,
  store: ConfigStore,
): ArtifactConfig {
  const stored = store[item.id] ?? {};
  return {
    geo: { ...defaultGeometry(item), ...stored.geo },
    obv: stored.obv || "",
    rev: stored.rev || "",
    fo: { ...DEFAULT_FIT, ...stored.fo },
    fr: { ...DEFAULT_FIT, ...stored.fr },
  };
}

export function artifactProps(item: CatalogItem, config: ArtifactConfig) {
  return {
    kind: item.kind,
    textured: item.tex,
    face: item.face,
    code: item.id,
    year: String(item.year),
    origin: item.origin,
    ...config,
  };
}
