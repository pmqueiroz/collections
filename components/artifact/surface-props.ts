import type { Fit, Geometry } from "./types";

export type SurfaceProps = {
  geo: Geometry;
  textured: boolean;
  obv: string;
  rev: string;
  fo?: Fit;
  fr?: Fit;
  face: string;
  code: string;
  year: string;
  origin: string;
};
