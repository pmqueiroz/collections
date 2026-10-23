import { useEffect, useMemo, useRef } from "react";
import { useLocale } from "../../i18n/locale-provider";
import { localePath } from "../../i18n/locales";
import { relicPagePath } from "./artifact-config";

const DRAWER_ENTRY = "relicDrawer";
const RELIC_PATH = /^\/[^/]+\/relics\/([^/]+)\/?$/;

function relicIdFromPath(pathname: string) {
  const match = RELIC_PATH.exec(pathname);
  return match ? decodeURIComponent(match[1]) : null;
}

function isDrawerEntry() {
  const state = window.history.state as Record<string, unknown> | null;
  return state?.[DRAWER_ENTRY] === true;
}

function replaceUrl(path: string, search: string) {
  if (window.location.pathname === path && window.location.search === search)
    return;
  window.history.replaceState(
    { [DRAWER_ENTRY]: isDrawerEntry() },
    "",
    `${path}${search}${window.location.hash}`,
  );
}

function replacePath(path: string) {
  replaceUrl(path, window.location.search);
}

export function replaceSearch(search: string) {
  replaceUrl(window.location.pathname, search);
}

export function useRelicHistory(onRoute: (id: string | null) => void) {
  const locale = useLocale();
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
          `${relicPagePath(locale, id)}${window.location.search}${window.location.hash}`,
        ),
      show: (id: string) => replacePath(relicPagePath(locale, id)),
      close: () => {
        if (isDrawerEntry()) window.history.back();
        else replacePath(localePath(locale));
      },
    }),
    [locale],
  );
}
