import type {
  ArtifactKind,
  EdgeStyle,
  Geometry,
} from "../../components/artifact/types";

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

export const CATALOG: CatalogItem[] = [
  {
    id: "NUM-C-0001",
    kind: "coin",
    title: "1 Franc · Semeuse",
    origin: "France",
    iso: "FRA",
    cur: "FRF",
    denom: "1",
    year: 1960,
    mint: "Paris",
    metal: "Nickel",
    dia: "24.00",
    thk: "1.80",
    wt: "6.00",
    edge: "Plain",
    cond: "XF",
    tex: true,
    face: "1 F",
  },
  {
    id: "NUM-C-0002",
    kind: "coin",
    title: "10 Pfennig",
    origin: "West Germany",
    iso: "DEU",
    cur: "DEM",
    denom: "0.10",
    year: 1950,
    mint: "F · Stuttgart",
    metal: "Brass-clad steel",
    dia: "21.50",
    thk: "1.70",
    wt: "4.00",
    edge: "Plain",
    cond: "VF",
    tex: true,
    face: "10",
  },
  {
    id: "NUM-C-0003",
    kind: "coin",
    title: "100 Yen · Rice",
    origin: "Japan",
    iso: "JPN",
    cur: "JPY",
    denom: "100",
    year: 1967,
    mint: "Osaka",
    metal: "Cupronickel",
    dia: "22.60",
    thk: "1.70",
    wt: "4.80",
    edge: "Reeded",
    cond: "AU",
    tex: false,
    face: "100",
  },
  {
    id: "NUM-C-0004",
    kind: "coin",
    title: "1 Shilling",
    origin: "United Kingdom",
    iso: "GBR",
    cur: "GBP",
    denom: "0.05",
    year: 1953,
    mint: "Royal Mint · London",
    metal: "Cupronickel",
    dia: "23.60",
    thk: "1.80",
    wt: "5.66",
    edge: "Reeded",
    cond: "AU",
    tex: true,
    face: "1/-",
  },
  {
    id: "NUM-C-0005",
    kind: "coin",
    title: "Quarter Dollar",
    origin: "United States",
    iso: "USA",
    cur: "USD",
    denom: "0.25",
    year: 1964,
    mint: "D · Denver",
    metal: "Silver .900",
    dia: "24.26",
    thk: "1.75",
    wt: "6.25",
    edge: "Reeded",
    cond: "UNC",
    tex: true,
    face: "25¢",
  },
  {
    id: "NUM-C-0006",
    kind: "coin",
    title: "5 Francs · Shepherd",
    origin: "Switzerland",
    iso: "CHE",
    cur: "CHF",
    denom: "5",
    year: 1968,
    mint: "B · Bern",
    metal: "Cupronickel",
    dia: "31.45",
    thk: "2.35",
    wt: "13.20",
    edge: "Lettered",
    cond: "XF",
    tex: false,
    face: "5",
  },
  {
    id: "NUM-C-0007",
    kind: "coin",
    title: "1 Rouble",
    origin: "USSR",
    iso: "SUN",
    cur: "SUR",
    denom: "1",
    year: 1970,
    mint: "Leningrad",
    metal: "Cu-Ni-Zn",
    dia: "31.00",
    thk: "2.30",
    wt: "12.80",
    edge: "Lettered",
    cond: "AU",
    tex: false,
    face: "1",
  },
  {
    id: "NUM-C-0008",
    kind: "coin",
    title: "2 Euro",
    origin: "Finland",
    iso: "FIN",
    cur: "EUR",
    denom: "2",
    year: 2002,
    mint: "Vantaa",
    metal: "Bimetallic",
    dia: "25.75",
    thk: "2.20",
    wt: "8.50",
    edge: "Fine reeded, lettered",
    cond: "UNC",
    tex: true,
    face: "2 €",
  },
  {
    id: "NUM-C-0009",
    kind: "coin",
    title: "1 Krone",
    origin: "Denmark",
    iso: "DNK",
    cur: "DKK",
    denom: "1",
    year: 1992,
    mint: "Copenhagen",
    metal: "Cupronickel",
    dia: "20.25",
    thk: "1.60",
    wt: "3.60",
    edge: "Plain",
    cond: "VF",
    tex: true,
    face: "1 Kr",
  },
  {
    id: "NUM-C-0010",
    kind: "coin",
    title: "5 Rials",
    origin: "Iran",
    iso: "IRN",
    cur: "IRR",
    denom: "5",
    year: 1975,
    mint: "Tehran",
    metal: "Cupronickel",
    dia: "26.00",
    thk: "2.00",
    wt: "9.00",
    edge: "Reeded",
    cond: "VF",
    tex: false,
    face: "5",
  },
  {
    id: "NUM-B-0001",
    kind: "note",
    title: "10 Gulden",
    origin: "Netherlands",
    iso: "NLD",
    cur: "NLG",
    denom: "10",
    year: 1968,
    series: "Frans Hals",
    printer: "Joh. Enschedé",
    size: "142 × 76",
    paper: "Cotton paper",
    cond: "VF",
    tex: true,
    face: "10",
  },
  {
    id: "NUM-B-0002",
    kind: "note",
    title: "100 Francs",
    origin: "France",
    iso: "FRA",
    cur: "FRF",
    denom: "100",
    year: 1978,
    series: "Delacroix",
    printer: "Banque de France",
    size: "160 × 85",
    paper: "Paper",
    cond: "XF",
    tex: true,
    face: "100",
  },
  {
    id: "NUM-B-0003",
    kind: "note",
    title: "1 Pound",
    origin: "United Kingdom",
    iso: "GBR",
    cur: "GBP",
    denom: "1",
    year: 1978,
    series: "Series D",
    printer: "Bank of England",
    size: "135 × 67",
    paper: "Paper",
    cond: "AU",
    tex: false,
    face: "£1",
  },
  {
    id: "NUM-B-0004",
    kind: "note",
    title: "1000 Yen",
    origin: "Japan",
    iso: "JPN",
    cur: "JPY",
    denom: "1000",
    year: 1984,
    series: "Series D",
    printer: "National Printing Bureau",
    size: "150 × 76",
    paper: "Mitsumata paper",
    cond: "UNC",
    tex: true,
    face: "1000",
  },
  {
    id: "NUM-B-0005",
    kind: "note",
    title: "5 Deutsche Mark",
    origin: "West Germany",
    iso: "DEU",
    cur: "DEM",
    denom: "5",
    year: 1991,
    series: "Series 4",
    printer: "Bundesdruckerei",
    size: "122 × 62",
    paper: "Cotton paper",
    cond: "UNC",
    tex: false,
    face: "5",
  },
  {
    id: "NUM-B-0006",
    kind: "note",
    title: "1 Dollar · Silver Certificate",
    origin: "United States",
    iso: "USA",
    cur: "USD",
    denom: "1",
    year: 1957,
    series: "1957",
    printer: "Bureau of Engraving and Printing",
    size: "156 × 66",
    paper: "Cotton-linen",
    cond: "F",
    tex: true,
    face: "$1",
  },
  {
    id: "NUM-B-0007",
    kind: "note",
    title: "50 Schilling",
    origin: "Austria",
    iso: "AUT",
    cur: "ATS",
    denom: "50",
    year: 1986,
    series: "Freud",
    printer: "OeBS",
    size: "144 × 72",
    paper: "Paper",
    cond: "XF",
    tex: false,
    face: "50",
  },
  {
    id: "TEL-0001",
    kind: "card",
    title: "Télécarte 50 Unités",
    origin: "France",
    iso: "FRA",
    year: 1989,
    issuer: "France Télécom",
    units: "50 U",
    chip: "SC5 · 8-contact",
    cond: "Used",
    tex: true,
    face: "50",
  },
  {
    id: "TEL-0002",
    kind: "card",
    title: "Telefonkarte 12 DM",
    origin: "Germany",
    iso: "DEU",
    year: 1994,
    issuer: "Deutsche Telekom",
    units: "12 DEM",
    chip: "Siemens · 6-contact",
    cond: "Mint",
    tex: true,
    face: "12",
  },
  {
    id: "TEL-0003",
    kind: "card",
    title: "Chipkaart 25 Gulden",
    origin: "Netherlands",
    iso: "NLD",
    year: 1996,
    issuer: "KPN Telecom",
    units: "25 NLG",
    chip: "Gemplus · 8-contact",
    cond: "Used",
    tex: false,
    face: "25",
  },
  {
    id: "TEL-0004",
    kind: "card",
    title: "Tarjeta 1000 Pesetas",
    origin: "Spain",
    iso: "ESP",
    year: 1998,
    issuer: "Telefónica",
    units: "1000 ESP",
    chip: "Schlumberger · 8-contact",
    cond: "Used",
    tex: true,
    face: "1000",
  },
  {
    id: "TEL-0005",
    kind: "card",
    title: "Ladatel 50 Pesos",
    origin: "Mexico",
    iso: "MEX",
    year: 1995,
    issuer: "Telmex",
    units: "50 MXN",
    chip: "Gemplus · 8-contact",
    cond: "Mint",
    tex: false,
    face: "50",
  },
  {
    id: "TEL-0006",
    kind: "card",
    title: "Telekort 50 Kr",
    origin: "Denmark",
    iso: "DNK",
    year: 1993,
    issuer: "Tele Danmark",
    units: "50 DKK",
    chip: "Siemens · 6-contact",
    cond: "Used",
    tex: true,
    face: "50",
  },
  {
    id: "TEL-0007",
    kind: "card",
    title: "Credifone 50",
    origin: "Portugal",
    iso: "PRT",
    year: 1997,
    issuer: "Portugal Telecom",
    units: "50 U",
    chip: "Schlumberger · 8-contact",
    cond: "Mint",
    tex: false,
    face: "50",
  },
  {
    id: "PHI-0001",
    kind: "stamp",
    title: "Penny Red",
    origin: "United Kingdom",
    iso: "GBR",
    cur: "GBP",
    denom: "1d",
    year: 1864,
    perf: "14",
    printing: "Line engraving",
    size: "19.0 × 22.5",
    paper: "Wove paper",
    cond: "Used",
    tex: true,
    face: "1d",
  },
  {
    id: "PHI-0002",
    kind: "stamp",
    title: "Marianne de Gandon 15 F",
    origin: "France",
    iso: "FRA",
    cur: "FRF",
    denom: "15",
    year: 1951,
    perf: "14 × 13½",
    printing: "Typography",
    size: "20.0 × 24.0",
    paper: "Paper",
    cond: "MNH",
    tex: true,
    face: "15F",
  },
  {
    id: "PHI-0003",
    kind: "stamp",
    title: "Posthorn 10 Pf",
    origin: "West Germany",
    iso: "DEU",
    cur: "DEM",
    denom: "0.10",
    year: 1951,
    perf: "14",
    printing: "Letterpress",
    size: "21.5 × 25.5",
    paper: "Watermarked paper",
    cond: "MH",
    tex: false,
    face: "10",
  },
  {
    id: "PHI-0004",
    kind: "stamp",
    title: "Lincoln 4¢",
    origin: "United States",
    iso: "USA",
    cur: "USD",
    denom: "0.04",
    year: 1954,
    perf: "11 × 10½",
    printing: "Rotary press",
    size: "19.0 × 22.0",
    paper: "Paper",
    cond: "Used",
    tex: true,
    face: "4¢",
  },
  {
    id: "PHI-0005",
    kind: "stamp",
    title: "Machin 3p",
    origin: "United Kingdom",
    iso: "GBR",
    cur: "GBP",
    denom: "0.03",
    year: 1971,
    perf: "15 × 14",
    printing: "Photogravure",
    size: "21.0 × 24.5",
    paper: "Paper · PVA gum",
    cond: "MNH",
    tex: false,
    face: "3p",
  },
  {
    id: "PHI-0006",
    kind: "stamp",
    title: "Ordinary 10 Yen",
    origin: "Japan",
    iso: "JPN",
    cur: "JPY",
    denom: "10",
    year: 1966,
    perf: "13",
    printing: "Photogravure",
    size: "22.0 × 27.0",
    paper: "Paper",
    cond: "Used",
    tex: true,
    face: "10",
  },
  {
    id: "PHI-0007",
    kind: "stamp",
    title: "Pro Patria 40 c",
    origin: "Switzerland",
    iso: "CHE",
    cur: "CHF",
    denom: "0.40",
    year: 1982,
    perf: "11¾",
    printing: "Photogravure",
    size: "20.0 × 24.0",
    paper: "Paper",
    cond: "MNH",
    tex: false,
    face: "40",
  },
];

export function itemField(item: CatalogItem, field: string): unknown {
  return (item as Record<string, unknown>)[field];
}

function parseSize(size: string) {
  return size.split("×").map((part) => Number.parseFloat(part));
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

export function defaultGeometry(item: CatalogItem): Geometry {
  const base = kindGeometry(item.kind);
  switch (item.kind) {
    case "coin": {
      const edge: EdgeStyle = /reed/i.test(item.edge) ? "reeded" : "plain";
      return {
        ...base,
        dia: +item.dia || base.dia,
        thk: +item.thk || base.thk,
        edge,
      };
    }
    case "note": {
      const [w, h] = parseSize(item.size);
      return { ...base, w: w || base.w, h: h || base.h };
    }
    case "card":
      return base;
    case "stamp": {
      const [w, h] = parseSize(item.size);
      return {
        ...base,
        w: w || base.w,
        h: h || base.h,
        perf: Number.parseFloat(item.perf) || base.perf,
      };
    }
  }
}

export function itemSubtitle(item: CatalogItem) {
  const parts =
    item.kind === "card"
      ? [item.year, item.iso, item.units, item.cond]
      : [item.year, item.iso, `${item.denom} ${item.cur}`, item.cond];
  return parts.join(" · ");
}
