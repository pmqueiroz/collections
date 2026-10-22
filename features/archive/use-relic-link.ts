import { useEffect, useRef } from "react";

const RELIC_PARAM = "relic";

function readRelicParam() {
  return new URLSearchParams(window.location.search).get(RELIC_PARAM);
}

function writeRelicParam(id: string | null) {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set(RELIC_PARAM, id);
  else url.searchParams.delete(RELIC_PARAM);
  const next = `${url.pathname}${url.search}${url.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next !== current) window.history.replaceState(null, "", next);
}

export function useRelicLink(
  openId: string | null,
  onLinked: (id: string) => boolean,
) {
  const linked = useRef(false);
  const handler = useRef(onLinked);
  handler.current = onLinked;

  useEffect(() => {
    if (!linked.current) {
      linked.current = true;
      const id = readRelicParam();
      if (id && handler.current(id)) return;
    }
    writeRelicParam(openId);
  }, [openId]);
}
