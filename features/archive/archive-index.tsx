"use client";

import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { CATALOG, type Domain, type SortKey } from "./catalog";
import {
  type ArtifactConfig,
  type ConfigStore,
  configFor,
  loadStore,
  persistStore,
} from "./config-store";
import { Configurator } from "./configurator/configurator";
import { DetailDrawer, ZOOM_MAX, ZOOM_MIN } from "./detail-drawer";
import { GridView } from "./grid-view";
import { Header, type View } from "./header";
import { HoverPreview, type PreviewPosition } from "./hover-preview";
import { ListView } from "./list-view";
import { domainCounts, queryCatalog, type SortDirection } from "./query";
import { readSession, signOut } from "./session";

type ArchiveIndexProps = {
  defaultView?: View;
  rowDensity?: "compact" | "regular";
  orbitRpm?: number;
  dwell?: number;
};

const PREVIEW_WIDTH = 290;
const PREVIEW_HEIGHT = 310;
const COUNTS = domainCounts();

export function ArchiveIndex({
  defaultView = "list",
  rowDensity = "compact",
  orbitRpm = 2,
  dwell = 300,
}: ArchiveIndexProps) {
  const [domain, setDomain] = useState<Domain>("all");
  const [sort, setSort] = useState<SortKey>("id");
  const [direction, setDirection] = useState<SortDirection>(1);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>(defaultView);
  const [preview, setPreview] = useState<PreviewPosition | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(true);
  const [flipped, setFlipped] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [resetKey, setResetKey] = useState(0);
  const [store, setStore] = useState<ConfigStore>({});
  const [authed, setAuthed] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [configKey, setConfigKey] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const items = useMemo(
    () => queryCatalog(domain, sort, direction, query),
    [domain, sort, direction, query],
  );
  const selected =
    CATALOG.find((item) => item.id === selectedId) ?? items[0] ?? CATALOG[0];
  const previewItem = preview
    ? CATALOG.find((item) => item.id === preview.id)
    : undefined;

  useEffect(() => {
    setStore(loadStore());
    readSession()
      .then(setAuthed)
      .catch(() => setAuthed(false));
  }, []);

  const unhover = () => {
    clearTimeout(timer.current);
    setPreview(null);
  };

  const onHover = (id: string, event: MouseEvent) => {
    const { clientX, clientY } = event;
    setPreview(null);
    clearTimeout(timer.current);
    if (open) return;
    timer.current = setTimeout(() => {
      let x = clientX + 20;
      if (x + PREVIEW_WIDTH > window.innerWidth) x = clientX - 300;
      const y = Math.max(
        8,
        Math.min(window.innerHeight - PREVIEW_HEIGHT, clientY - 40),
      );
      setPreview({ id, x: Math.max(8, x), y });
    }, dwell);
  };

  const openItem = (id: string) => {
    clearTimeout(timer.current);
    setPreview(null);
    setSelectedId(id);
    setOpen(true);
    setFlipped(false);
    setZoom(1);
    setSpinning(true);
    setResetKey((key) => key + 1);
  };

  const step = (offset: number) => {
    if (!items.length) return;
    const index = items.findIndex((item) => item.id === selected.id);
    const next =
      items[((index < 0 ? 0 : index + offset) + items.length) % items.length];
    setSelectedId(next.id);
    setFlipped(false);
    setResetKey((key) => key + 1);
  };

  const onSort = (key: SortKey) => {
    if (key === sort) setDirection((current) => (current > 0 ? -1 : 1));
    else {
      setSort(key);
      setDirection(1);
    }
  };

  const changeZoom = (delta: number) =>
    setZoom((current) =>
      Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, +(current + delta).toFixed(2))),
    );

  const openConfigurator = () => {
    setConfiguring(true);
    setConfigKey((key) => key + 1);
  };

  const commit = (next: ConfigStore) => {
    if (!persistStore(next)) return false;
    setStore(next);
    setConfiguring(false);
    return true;
  };

  const keys = useRef({ open, configuring, step, openConfigurator });
  keys.current = { open, configuring, step, openConfigurator };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const state = keys.current;
      if (!state.open || state.configuring) return;
      const target = event.target as HTMLElement | null;
      if (event.key === "Escape") setOpen(false);
      else if (target?.tagName === "INPUT") return;
      else if (event.key === "e" || event.key === "E") state.openConfigurator();
      else if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        state.step(1);
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        state.step(-1);
      } else if (event.key === "f" || event.key === "F")
        setFlipped((value) => !value);
      else if (event.key === " ") {
        event.preventDefault();
        setSpinning((value) => !value);
      }
    };
    const onScroll = () => {
      clearTimeout(timer.current);
      setPreview(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      clearTimeout(timer.current);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, []);

  const selectedConfig = configFor(selected, store);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Header
        shown={items.length}
        total={CATALOG.length}
        authed={authed}
        onSignOut={() => {
          signOut().finally(() => setAuthed(false));
        }}
        domain={domain}
        counts={COUNTS}
        onDomain={setDomain}
        sort={sort}
        direction={direction}
        onSort={onSort}
        query={query}
        onQuery={setQuery}
        view={view}
        onView={(next) => {
          if (next === "grid") unhover();
          setView(next);
        }}
      />

      {items.length === 0 ? (
        <div className="px-7 py-16 mono text-cell text-faint">
          No records match “{query}”.
        </div>
      ) : view === "list" ? (
        <ListView
          items={items}
          domain={domain}
          sort={sort}
          direction={direction}
          onSort={onSort}
          selectedId={open ? selected.id : null}
          rowHeight={rowDensity === "regular" ? 52 : 42}
          onOpen={openItem}
          onHover={onHover}
          onUnhover={unhover}
        />
      ) : (
        <GridView items={items} store={store} onOpen={openItem} />
      )}

      {preview && previewItem && (
        <HoverPreview
          item={previewItem}
          config={configFor(previewItem, store)}
          x={preview.x}
          y={preview.y}
        />
      )}

      <DetailDrawer
        open={open}
        item={selected}
        config={selectedConfig}
        onClose={() => setOpen(false)}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
        onConfigure={openConfigurator}
        spinning={spinning}
        onToggleSpin={() => setSpinning((value) => !value)}
        flipped={flipped}
        onFlip={setFlipped}
        zoom={zoom}
        onZoom={changeZoom}
        rpm={orbitRpm}
        resetKey={resetKey}
        onReset={() => {
          setZoom(1);
          setFlipped(false);
          setSpinning(true);
          setResetKey((key) => key + 1);
        }}
      />

      {configuring && (
        <Configurator
          key={configKey}
          item={selected}
          config={selectedConfig}
          stored={Boolean(store[selected.id])}
          authed={authed}
          onAuthed={() => setAuthed(true)}
          onSave={(draft: ArtifactConfig) =>
            commit({ ...store, [selected.id]: draft })
          }
          onDelete={() => {
            const { [selected.id]: _removed, ...rest } = store;
            return commit(rest);
          }}
          onClose={() => setConfiguring(false)}
        />
      )}
    </div>
  );
}
