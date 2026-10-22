import {
  CARD_DIMENSIONS,
  type CatalogItem,
  CONDITION_NAME,
  type Domain,
  itemField,
  KIND_LABEL,
  MESH_LABEL,
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

export type Column = {
  field: string;
  label: string;
  track: string;
  type: CellType;
  sort?: SortKey;
};

export const CELL_CLASS: Record<CellType, string> = {
  id: "mono text-cell font-normal text-ink",
  title: "text-sm font-medium text-ink",
  text: "text-row font-normal text-ink",
  meta: "text-row font-normal text-muted",
  code: "mono text-cell font-medium text-ink",
  num: "mono text-cell font-normal text-ink text-right",
  mono: "mono text-cell font-normal text-ink",
  mono2: "mono text-xs font-normal text-muted",
};

function column(
  field: string,
  label: string,
  track: string,
  type: CellType,
  sort?: SortKey,
): Column {
  return { field, label, track, type, sort };
}

const ID = column("id", "Catalog ID", "112px", "id", "id");

export const COLUMNS: Record<Domain, Column[]> = {
  all: [
    ID,
    column("title", "Designation", "minmax(0,2.4fr)", "title"),
    column("kindLabel", "Domain", "92px", "meta"),
    column("iso", "ISO", "40px", "code", "origin"),
    column("origin", "Origin", "minmax(0,1.2fr)", "text"),
    column("year", "Year", "48px", "mono", "year"),
    column("cond", "Cond", "52px", "mono", "cond"),
  ],
  coin: [
    ID,
    column("title", "Designation", "minmax(0,1.6fr)", "title"),
    column("denom", "Denom", "52px", "num"),
    column("cur", "Cur", "36px", "code"),
    column("iso", "ISO", "36px", "code", "origin"),
    column("year", "Minted", "52px", "mono", "year"),
    column("mint", "Mint", "minmax(0,1fr)", "meta"),
    column("metal", "Metal", "minmax(0,1.1fr)", "meta"),
    column("dia", "Ø mm", "52px", "num"),
    column("wt", "Wt g", "48px", "num"),
    column("cond", "Cond", "40px", "mono", "cond"),
  ],
  note: [
    ID,
    column("title", "Designation", "minmax(0,1.6fr)", "title"),
    column("denom", "Denom", "52px", "num"),
    column("cur", "Cur", "36px", "code"),
    column("iso", "ISO", "36px", "code", "origin"),
    column("year", "Issued", "52px", "mono", "year"),
    column("series", "Series", "minmax(0,1fr)", "meta"),
    column("printer", "Printer", "minmax(0,1.3fr)", "meta"),
    column("size", "Size mm", "76px", "mono2"),
    column("cond", "Cond", "40px", "mono", "cond"),
  ],
  card: [
    ID,
    column("title", "Designation", "minmax(0,1.8fr)", "title"),
    column("iso", "ISO", "36px", "code", "origin"),
    column("issuer", "Issuer", "minmax(0,1.2fr)", "meta"),
    column("units", "Units", "72px", "mono"),
    column("chip", "Chip", "minmax(0,1.3fr)", "mono2"),
    column("year", "Issued", "52px", "mono", "year"),
    column("cond", "Cond", "44px", "mono", "cond"),
  ],
  stamp: [
    ID,
    column("title", "Designation", "minmax(0,1.8fr)", "title"),
    column("denom", "Face", "48px", "num"),
    column("cur", "Cur", "36px", "code"),
    column("iso", "ISO", "36px", "code", "origin"),
    column("year", "Issued", "52px", "mono", "year"),
    column("perf", "Perf", "76px", "mono2"),
    column("printing", "Printing", "minmax(0,1fr)", "meta"),
    column("size", "Size mm", "88px", "mono2"),
    column("cond", "Cond", "44px", "mono", "cond"),
  ],
};

export const MIN_TABLE_WIDTH: Record<Domain, number> = {
  all: 1000,
  coin: 1180,
  note: 1120,
  card: 1040,
  stamp: 1100,
};

export function cellValue(item: CatalogItem, field: string) {
  if (field === "kindLabel") return KIND_LABEL[item.kind];
  return String(itemField(item, field) ?? "—");
}

export type SpecRow = { label: string; value: string };

function kindSpec(item: CatalogItem): [string, string][] {
  switch (item.kind) {
    case "coin":
      return [
        ["Denomination", `${item.denom} ${item.cur}`],
        ["Mint", item.mint],
        ["Metal", item.metal],
        ["Diameter", `${item.dia} mm`],
        ["Thickness", `${item.thk} mm`],
        ["Weight", `${item.wt} g`],
        ["Edge", item.edge],
      ];
    case "note":
      return [
        ["Denomination", `${item.denom} ${item.cur}`],
        ["Series", item.series],
        ["Printer", item.printer],
        ["Size", `${item.size} mm`],
        ["Substrate", item.paper],
      ];
    case "card":
      return [
        ["Issuer", item.issuer],
        ["Units", item.units],
        ["Chip", item.chip],
        ["Dimensions", CARD_DIMENSIONS],
        ["Material", "PVC"],
      ];
    case "stamp":
      return [
        ["Face value", `${item.denom} ${item.cur}`],
        ["Perforation", item.perf],
        ["Printing", item.printing],
        ["Size", `${item.size} mm`],
        ["Paper", item.paper],
      ];
  }
}

export function specRows(item: CatalogItem): SpecRow[] {
  const yearLabel = item.kind === "coin" ? "Mint year" : "Issue year";
  const rows: [string, string][] = [
    ["Catalog ID", item.id],
    ["Domain", KIND_LABEL[item.kind]],
    ["Designation", item.title],
    ["Origin", `${item.origin} · ${item.iso}`],
    [yearLabel, String(item.year)],
    ["Condition", `${item.cond} — ${CONDITION_NAME[item.cond]}`],
    ...kindSpec(item),
    ["Mesh", MESH_LABEL[item.kind]],
  ];
  return rows.map(([label, value]) => ({ label, value }));
}
