export type ArtifactKind = "coin" | "note" | "card" | "stamp";

export type ArtifactMode = "static" | "tilt" | "orbit";

export type EdgeStyle = "reeded" | "plain";

export type Geometry = {
  dia?: number;
  thk?: number;
  bevel?: number;
  edge?: EdgeStyle;
  w?: number;
  h?: number;
  curve?: number;
  r?: number;
  chipX?: number;
  chipY?: number;
  chip?: boolean;
  perf?: number;
  hole?: number;
  margin?: number;
};

export type Fit = {
  s: number;
  x: number;
  y: number;
  r: number;
};

export type FaceSide = "obv" | "rev";
