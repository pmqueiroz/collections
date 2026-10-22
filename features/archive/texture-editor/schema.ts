import type {
  ArtifactKind,
  EdgeStyle,
  Fit,
  Geometry,
} from "../../../components/artifact/types";

export type NumericField<K extends string> = {
  key: K;
  label: string;
  min: number;
  max: number;
  step: number;
};

type NumericGeometryKey = {
  [K in keyof Geometry]-?: Geometry[K] extends number | undefined ? K : never;
}[keyof Geometry];

function field<K extends string>(
  key: K,
  label: string,
  min: number,
  max: number,
  step: number,
): NumericField<K> {
  return { key, label, min, max, step };
}

export const FIT_FIELDS: NumericField<keyof Fit>[] = [
  field("s", "Scale", 0.3, 3, 0.01),
  field("x", "Offset X %", -200, 200, 0.5),
  field("y", "Offset Y %", -200, 200, 0.5),
  field("r", "Rotate °", -180, 180, 0.5),
];

export const GEOMETRY_FIELDS: Record<
  ArtifactKind,
  NumericField<NumericGeometryKey>[]
> = {
  coin: [
    field("dia", "Diameter mm", 10, 45, 0.05),
    field("thk", "Thickness mm", 0.8, 4, 0.05),
    field("bevel", "Rim mm", 0, 3, 0.05),
  ],
  note: [
    field("w", "Width mm", 90, 200, 0.5),
    field("h", "Height mm", 45, 110, 0.5),
    field("curve", "Curve mm", 0, 6, 0.1),
  ],
  card: [
    field("w", "Width mm", 60, 100, 0.01),
    field("h", "Height mm", 40, 70, 0.01),
    field("r", "Radius mm", 0, 8, 0.01),
    field("thk", "Thickness mm", 0.3, 1.5, 0.01),
    field("chipX", "Chip X mm", 2, 40, 0.1),
    field("chipY", "Chip Y mm", 2, 40, 0.1),
  ],
  stamp: [
    field("w", "Width mm", 12, 60, 0.1),
    field("h", "Height mm", 12, 60, 0.1),
    field("perf", "Perf gauge", 8, 18, 0.25),
    field("hole", "Hole ratio", 0.2, 0.9, 0.01),
    field("margin", "Margin mm", 0, 5, 0.1),
  ],
};

export type OptionField =
  | {
      key: "edge";
      label: string;
      choices: { value: EdgeStyle; label: string }[];
    }
  | {
      key: "chip";
      label: string;
      choices: { value: boolean; label: string }[];
    };

export const OPTION_FIELDS: Record<ArtifactKind, OptionField[]> = {
  coin: [
    {
      key: "edge",
      label: "Edge",
      choices: [
        { value: "reeded", label: "Reeded" },
        { value: "plain", label: "Plain" },
      ],
    },
  ],
  card: [
    {
      key: "chip",
      label: "Chip",
      choices: [
        { value: true, label: "On" },
        { value: false, label: "Off" },
      ],
    },
  ],
  note: [],
  stamp: [],
};

export function displayValue(value: number | undefined, step: number) {
  const digits = step < 0.1 ? 2 : step < 1 ? 1 : 0;
  return +(+(value ?? 0)).toFixed(digits);
}
