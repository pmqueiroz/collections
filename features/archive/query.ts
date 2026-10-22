import {
  type CatalogItem,
  CONDITION_RANK,
  type Domain,
  KIND_LABEL,
  type SortKey,
} from "./catalog";

export type SortDirection = 1 | -1;

const COMPARE: Record<SortKey, (a: CatalogItem, b: CatalogItem) => number> = {
  id: (a, b) => a.id.localeCompare(b.id),
  year: (a, b) => a.year - b.year,
  origin: (a, b) => a.iso.localeCompare(b.iso),
  cond: (a, b) => CONDITION_RANK[a.cond] - CONDITION_RANK[b.cond],
};

function searchText(item: CatalogItem) {
  const extra =
    item.kind === "coin"
      ? [item.cur, item.mint]
      : item.kind === "note"
        ? [item.cur, item.series]
        : item.kind === "card"
          ? [item.issuer]
          : [item.cur];
  return [
    item.id,
    item.title,
    item.origin,
    item.iso,
    String(item.year),
    KIND_LABEL[item.kind],
    item.cond,
    ...extra,
  ]
    .join(" ")
    .toLowerCase();
}

export function queryCatalog(
  catalog: CatalogItem[],
  domain: Domain,
  sort: SortKey,
  direction: SortDirection,
  query: string,
) {
  const needle = query.trim().toLowerCase();
  const compare = COMPARE[sort];
  return catalog
    .filter(
      (item) =>
        (domain === "all" || item.kind === domain) &&
        (!needle || searchText(item).includes(needle)),
    )
    .sort((a, b) => (compare(a, b) || a.id.localeCompare(b.id)) * direction);
}

export function domainCounts(catalog: CatalogItem[]) {
  const counts: Record<Domain, number> = {
    all: catalog.length,
    coin: 0,
    note: 0,
    card: 0,
    stamp: 0,
  };
  for (const item of catalog) counts[item.kind] += 1;
  return counts;
}
