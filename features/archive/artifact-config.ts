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

export function blankConfig(geo: Geometry): ArtifactConfig {
  return {
    geo,
    obv: "",
    rev: "",
    fo: { ...DEFAULT_FIT },
    fr: { ...DEFAULT_FIT },
  };
}

export function artifactProps(
  item: CatalogItem,
  config: ArtifactConfig = blankConfig(defaultGeometry(item)),
) {
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
