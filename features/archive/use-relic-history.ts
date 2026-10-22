import { useEffect, useMemo, useRef } from "react";

const DRAWER_ENTRY = "relicDrawer";
const INDEX_PATH = "/";
const RELIC_PATH = /^\/relics\/([^/]+)\/?$/;

export function relicPagePath(id: string) {
  return `/relics/${encodeURIComponent(id)}`;
}

function relicIdFromPath(pathname: string) {
  const match = RELIC_PATH.exec(pathname);
  return match ? decodeURIComponent(match[1]) : null;
}

function isDrawerEntry() {
  const state = window.history.state as Record<string, unknown> | null;
  return state?.[DRAWER_ENTRY] === true;
}

function replacePath(path: string) {
  if (window.location.pathname === path) return;
  window.history.replaceState(
    { [DRAWER_ENTRY]: isDrawerEntry() },
    "",
    `${path}${window.location.search}${window.location.hash}`,
  );
}

export function useRelicHistory(onRoute: (id: string | null) => void) {
  const handler = useRef(onRoute);
  handler.current = onRoute;

  useEffect(() => {
    const onPopState = () =>
      handler.current(relicIdFromPath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return useMemo(
    () => ({
      open: (id: string) =>
        window.history.pushState(
          { [DRAWER_ENTRY]: true },
          "",
          `${relicPagePath(id)}${window.location.search}${window.location.hash}`,
        ),
      show: (id: string) => replacePath(relicPagePath(id)),
      close: () => {
        if (isDrawerEntry()) window.history.back();
        else replacePath(INDEX_PATH);
      },
    }),
    [],
  );
}
