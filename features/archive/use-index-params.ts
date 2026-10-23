import { useEffect, useRef, useState } from "react";
import { DOMAINS, type Domain, SORTS, type SortKey } from "./catalog";
import type { View } from "./header";
import type { SortDirection } from "./query";
import { replaceSearch } from "./use-relic-history";

export type IndexParams = {
  domain: Domain;
  sort: SortKey;
  direction: SortDirection;
  query: string;
  view: View;
};

const VIEWS: View[] = ["grid", "list"];
const WRITE_DELAY = 250;

function indexDefaults(view: View): IndexParams {
  return { domain: "all", sort: "id", direction: 1, query: "", view };
}

function pick<T extends string>(
  options: readonly T[],
  value: string | null,
  fallback: T,
) {
  return options.find((option) => option === value) ?? fallback;
}

function readDirection(value: string | null, fallback: SortDirection) {
  if (value === "asc") return 1;
  if (value === "desc") return -1;
  return fallback;
}

function readIndexParams(search: string, defaults: IndexParams): IndexParams {
  const params = new URLSearchParams(search);
  return {
    domain: pick(DOMAINS, params.get("tab"), defaults.domain),
    sort: pick(SORTS, params.get("sort"), defaults.sort),
    direction: readDirection(params.get("dir"), defaults.direction),
    query: params.get("q") ?? defaults.query,
    view: pick(VIEWS, params.get("view"), defaults.view),
  };
}

function indexSearch(state: IndexParams, defaults: IndexParams) {
  const params = new URLSearchParams();
  if (state.domain !== defaults.domain) params.set("tab", state.domain);
  if (state.sort !== defaults.sort) params.set("sort", state.sort);
  if (state.direction !== defaults.direction)
    params.set("dir", state.direction > 0 ? "asc" : "desc");
  if (state.query) params.set("q", state.query);
  if (state.view !== defaults.view) params.set("view", state.view);
  const search = params.toString();
  return search ? `?${search}` : "";
}

export function useIndexParams(
  state: IndexParams,
  defaultView: View,
  apply: (state: IndexParams) => void,
) {
  const [loaded, setLoaded] = useState(false);
  const handler = useRef(apply);
  handler.current = apply;

  useEffect(() => {
    const defaults = indexDefaults(defaultView);
    const sync = () =>
      handler.current(readIndexParams(window.location.search, defaults));
    sync();
    setLoaded(true);
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [defaultView]);

  const { domain, sort, direction, query, view } = state;
  useEffect(() => {
    if (!loaded) return;
    const search = indexSearch(
      { domain, sort, direction, query, view },
      indexDefaults(defaultView),
    );
    const timer = setTimeout(() => replaceSearch(search), WRITE_DELAY);
    return () => clearTimeout(timer);
  }, [loaded, domain, sort, direction, query, view, defaultView]);
}
