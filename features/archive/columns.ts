import type { Dictionary } from "../../i18n/dictionary";
import {
  CARD_DIMENSIONS,
  type CatalogItem,
  type Domain,
  itemField,
  itemYear,
  type SortKey,
} from "./catalog";

export type CellType =
  | "id"
  | "title"
  | "text"
  | "meta"
  | "code"
  | "num"
  | "mono"
  | "mono2";

type ColumnLabel = keyof Dictionary["columns"];

export type Column = {
  field: string;
  label: ColumnLabel;
  track: string;
  type: CellType;
  sort?: SortKey;
};

export const CELL_CLASS: Record<CellType, string> = {
  id: "mono text-cell font-normal text-ink",
  title: "text-sm font-medium tracking-ui text-ink",
  text: "text-row font-normal tracking-ui text-ink",
  meta: "text-row font-normal tracking-ui text-muted",
  code: "mono text-cell font-medium text-ink",
  num: "mono text-cell font-normal text-ink text-right",
  mono: "mono text-cell font-normal text-ink",
  mono2: "mono text-xs font-normal text-muted",
};

function column(
  field: string,
  label: ColumnLabel,
  track: string,
  type: CellType,
  sort?: SortKey,
): Column {
  return { field, label, track, type, sort };
}

const ID = column("id", "id", "112px", "id", "id");

export const COLUMNS: Record<Domain, Column[]> = {
  all: [
    ID,
    column("title", "title", "minmax(0,2.4fr)", "title"),
    column("kindLabel", "domain", "92px", "meta"),
    column("iso", "iso", "40px", "code", "origin"),
    column("origin", "origin", "minmax(0,1.2fr)", "text"),
    column("year", "year", "48px", "mono", "year"),
    column("cond", "cond", "52px", "mono", "cond"),
  ],
  coin: [
    ID,
    column("title", "title", "minmax(0,1.6fr)", "title"),
    column("denom", "denom", "52px", "num"),
    column("cur", "cur", "36px", "code"),
    column("iso", "iso", "36px", "code", "origin"),
    column("year", "minted", "52px", "mono", "year"),
    column("mint", "mint", "minmax(0,1fr)", "meta"),
    column("metal", "metal", "minmax(0,1.1fr)", "meta"),
    column("dia", "dia", "52px", "num"),
    column("wt", "wt", "48px", "num"),
    column("cond", "cond", "40px", "mono", "cond"),
  ],
  note: [
    ID,
    column("title", "title", "minmax(0,1.6fr)", "title"),
    column("denom", "denom", "52px", "num"),
    column("cur", "cur", "36px", "code"),
    column("iso", "iso", "36px", "code", "origin"),
    column("year", "issued", "52px", "mono", "year"),
    column("series", "series", "minmax(0,1fr)", "meta"),
    column("printer", "printer", "minmax(0,1.3fr)", "meta"),
    column("size", "size", "76px", "mono2"),
    column("cond", "cond", "40px", "mono", "cond"),
  ],
  card: [
    ID,
    column("title", "title", "minmax(0,1.8fr)", "title"),
    column("iso", "iso", "36px", "code", "origin"),
    column("issuer", "issuer", "minmax(0,1.2fr)", "meta"),
    column("units", "units", "72px", "mono"),
    column("chip", "chip", "minmax(0,1.3fr)", "mono2"),
    column("year", "issued", "52px", "mono", "year"),
    column("cond", "cond", "44px", "mono", "cond"),
  ],
  stamp: [
    ID,
    column("title", "title", "minmax(0,1.8fr)", "title"),
    column("denom", "face", "48px", "num"),
    column("cur", "cur", "36px", "code"),
    column("iso", "iso", "36px", "code", "origin"),
    column("year", "issued", "52px", "mono", "year"),
    column("perf", "perf", "76px", "mono2"),
    column("printing", "printing", "minmax(0,1fr)", "meta"),
    column("size", "size", "88px", "mono2"),
    column("cond", "cond", "44px", "mono", "cond"),
  ],
};

export const MIN_TABLE_WIDTH: Record<Domain, number> = {
  all: 1000,
  coin: 1180,
  note: 1120,
  card: 1040,
  stamp: 1100,
};

export function cellValue(item: CatalogItem, field: string, dict: Dictionary) {
  if (field === "kindLabel") return dict.kind[item.kind];
  return String(itemField(item, field) ?? "—");
}

export type SpecRow = { label: string; value: string };

function withUnit(value: string, unit: string) {
  return value === "—" ? value : `${value} ${unit}`;
}

type SpecLabel = keyof Dictionary["spec"];

function kindSpec(item: CatalogItem): [SpecLabel, string][] {
  switch (item.kind) {
    case "coin":
      return [
        ["denomination", `${item.denom} ${item.cur}`],
        ["mint", item.mint],
        ["metal", item.metal],
        ["diameter", withUnit(item.dia, "mm")],
        ["thickness", withUnit(item.thk, "mm")],
        ["weight", withUnit(item.wt, "g")],
        ["edge", item.edge],
      ];
    case "note":
      return [
        ["denomination", `${item.denom} ${item.cur}`],
        ["series", item.series],
        ["printer", item.printer],
        ["size", `${item.size} mm`],
        ["substrate", item.paper],
      ];
    case "card":
      return [
        ["issuer", item.issuer],
        ["units", item.units],
        ["chip", item.chip],
        ["dimensions", CARD_DIMENSIONS],
        ["material", "PVC"],
      ];
    case "stamp":
      return [
        ["faceValue", `${item.denom} ${item.cur}`],
        ["perforation", item.perf],
        ["printing", item.printing],
        ["size", `${item.size} mm`],
        ["paper", item.paper],
      ];
  }
}

export function specRows(item: CatalogItem, dict: Dictionary): SpecRow[] {
  const rows: [SpecLabel, string][] = [
    ["id", item.id],
    ["domain", dict.kind[item.kind]],
    ["title", item.title],
    ["origin", `${item.origin} · ${item.iso}`],
    [item.kind === "coin" ? "mintYear" : "issueYear", itemYear(item)],
    ["amount", String(item.amount)],
    ["cond", `${item.cond} — ${dict.condition[item.cond]}`],
    ...kindSpec(item),
    ["mesh", dict.mesh[item.kind]],
  ];
  return rows.map(([label, value]) => ({ label: dict.spec[label], value }));
}
