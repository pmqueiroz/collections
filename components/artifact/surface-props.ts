import type { Fit, Geometry } from "./types";

export type SurfaceProps = {
  geo: Geometry;
  obv: string;
  rev: string;
  fo?: Fit;
  fr?: Fit;
  face: string;
  code: string;
  year: string;
  origin: string;
};

export type MeshProps = SurfaceProps & { flat: boolean };
