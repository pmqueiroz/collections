import type {
  ArtifactKind,
  EdgeStyle,
  Fit,
  Geometry,
} from "../../../components/artifact/types";
import type { Dictionary } from "../../../i18n/dictionary";

export type NumericField<K extends string> = {
  key: K;
  min: number;
  max: number;
  step: number;
};

type NumericGeometryKey = {
  [K in keyof Geometry]-?: Geometry[K] extends number | undefined ? K : never;
}[keyof Geometry];

function field<K extends string>(
  key: K,
  min: number,
  max: number,
  step: number,
): NumericField<K> {
  return { key, min, max, step };
}

export const FIT_FIELDS: NumericField<keyof Fit>[] = [
  field("s", 0.3, 3, 0.01),
  field("x", -200, 200, 0.5),
  field("y", -200, 200, 0.5),
  field("r", -180, 180, 0.5),
];

export const GEOMETRY_FIELDS: Record<
  ArtifactKind,
  NumericField<NumericGeometryKey>[]
> = {
  coin: [
    field("dia", 10, 45, 0.05),
    field("thk", 0.8, 4, 0.05),
    field("bevel", 0, 3, 0.05),
  ],
  note: [
    field("w", 90, 200, 0.5),
    field("h", 45, 110, 0.5),
    field("curve", 0, 6, 0.1),
  ],
  card: [
    field("w", 60, 100, 0.01),
    field("h", 40, 70, 0.01),
    field("r", 0, 8, 0.01),
    field("thk", 0.3, 1.5, 0.01),
    field("chipX", 2, 40, 0.1),
    field("chipY", 2, 40, 0.1),
  ],
  stamp: [
    field("w", 12, 60, 0.1),
    field("h", 12, 60, 0.1),
    field("perf", 8, 18, 0.25),
    field("hole", 0.2, 0.9, 0.01),
    field("margin", 0, 5, 0.1),
  ],
};

type ChoiceLabel = keyof Dictionary["editor"]["choice"];

export type OptionField =
  | {
      key: "edge";
      choices: { value: EdgeStyle; label: ChoiceLabel }[];
    }
  | {
      key: "chip";
      choices: { value: boolean; label: ChoiceLabel }[];
    };

export const OPTION_FIELDS: Record<ArtifactKind, OptionField[]> = {
  coin: [
    {
      key: "edge",
      choices: [
        { value: "reeded", label: "reeded" },
        { value: "plain", label: "plain" },
      ],
    },
  ],
  card: [
    {
      key: "chip",
      choices: [
        { value: true, label: "on" },
        { value: false, label: "off" },
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
