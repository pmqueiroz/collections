import { useCallback, useSyncExternalStore } from "react";

export const COMPACT_QUERY = "(max-width: 719.98px)";
export const FINE_HOVER_QUERY = "(hover: hover) and (pointer: fine)";

export function useMediaQuery(query: string, serverValue = false) {
  const subscribe = useCallback(
    (notify: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
