import type { ArtifactKind, Geometry } from "../../components/artifact/types";
import type { ArtifactModel } from "./artifact-config";

export type Condition =
  | "UNC"
  | "AU"
  | "XF"
  | "VF"
  | "F"
  | "Mint"
  | "Used"
  | "MNH"
  | "MH";

type BaseItem = {
  id: string;
  title: string;
  origin: string;
  iso: string;
  year: number;
  cond: Condition;
  tex: boolean;
  face: string;
  model: ArtifactModel;
  faces: { obv: boolean; rev: boolean };
};

export type CoinItem = BaseItem & {
  kind: "coin";
  cur: string;
  denom: string;
  mint: string;
  metal: string;
  dia: string;
  thk: string;
  wt: string;
  edge: string;
};

export type NoteItem = BaseItem & {
  kind: "note";
  cur: string;
  denom: string;
  series: string;
  printer: string;
  size: string;
  paper: string;
};

export type CardItem = BaseItem & {
  kind: "card";
  issuer: string;
  units: string;
  chip: string;
};

export type StampItem = BaseItem & {
  kind: "stamp";
  cur: string;
  denom: string;
  perf: string;
  printing: string;
  size: string;
  paper: string;
};

export type CatalogItem = CoinItem | NoteItem | CardItem | StampItem;

export type Domain = "all" | ArtifactKind;

export type SortKey = "id" | "year" | "origin" | "cond";

export const KIND_LABEL: Record<ArtifactKind, string> = {
  coin: "Coin",
  note: "Banknote",
  card: "Phonecard",
  stamp: "Stamp",
};

export const KINDS = Object.keys(KIND_LABEL) as ArtifactKind[];

export const DOMAINS: { value: Domain; label: string }[] = [
  { value: "all", label: "All" },
  { value: "coin", label: "Coins" },
  { value: "note", label: "Banknotes" },
  { value: "card", label: "Phonecards" },
  { value: "stamp", label: "Stamps" },
];

export function domainTitle(domain: Domain) {
  if (domain === "all") return "Index";
  return DOMAINS.find((option) => option.value === domain)?.label ?? "Index";
}

export const SORTS: { value: SortKey; label: string }[] = [
  { value: "id", label: "Catalog ID" },
  { value: "year", label: "Year" },
  { value: "origin", label: "Origin" },
  { value: "cond", label: "Condition" },
];

export const CONDITION_RANK: Record<Condition, number> = {
  UNC: 1,
  Mint: 1,
  MNH: 1,
  AU: 2,
  MH: 2,
  XF: 3,
  VF: 4,
  Used: 4,
  F: 5,
};

export const CONDITION_NAME: Record<Condition, string> = {
  UNC: "Uncirculated",
  AU: "About uncirculated",
  XF: "Extremely fine",
  VF: "Very fine",
  F: "Fine",
  Mint: "Mint, unused",
  Used: "Used",
  MNH: "Mint never hinged",
  MH: "Mint hinged",
};

export const MESH_LABEL: Record<ArtifactKind, string> = {
  coin: "Cylinder · beveled rim · 40-seg reeded edge",
  note: "Plane · 0.2 mm · rested curve, 11 seg",
  card: "ID-1 · r 3.18 mm · flush chip indent",
  stamp: "Plane · die-cut perforation",
};

export const CARD_DIMENSIONS = "85.60 × 53.98 × 0.76 mm";

export function itemField(item: CatalogItem, field: string): unknown {
  return (item as Record<string, unknown>)[field];
}

const KIND_GEOMETRY: Record<ArtifactKind, Geometry> = {
  coin: { dia: 24, thk: 1.8, bevel: 1, edge: "reeded" },
  note: { w: 150, h: 76, curve: 1.5 },
  card: {
    w: 85.6,
    h: 53.98,
    r: 3.18,
    thk: 0.76,
    chipX: 9.4,
    chipY: 19.7,
    chip: true,
  },
  stamp: { w: 20, h: 24, perf: 14, hole: 0.55, margin: 1.6 },
};

export function kindGeometry(kind: ArtifactKind): Geometry {
  return { ...KIND_GEOMETRY[kind] };
}

export function itemSubtitle(item: CatalogItem) {
  const parts =
    item.kind === "card"
      ? [item.year, item.iso, item.units, item.cond]
      : [item.year, item.iso, `${item.denom} ${item.cur}`, item.cond];
  return parts.join(" · ");
}
