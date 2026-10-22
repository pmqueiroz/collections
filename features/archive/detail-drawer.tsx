import { Artifact } from "../../components/artifact/artifact";
import { Button } from "../../components/ui/button";
import { cx } from "../../components/ui/cx";
import { SectionLabel } from "../../components/ui/section-label";
import { SegmentedControl } from "../../components/ui/segmented-control";
import { type CatalogItem, KIND_LABEL } from "./catalog";
import { specRows } from "./columns";
import { type ArtifactConfig, artifactProps } from "./config-store";

export const ZOOM_MIN = 0.6;
export const ZOOM_MAX = 2.4;

type DetailDrawerProps = {
  open: boolean;
  item: CatalogItem;
  config: ArtifactConfig;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onConfigure: () => void;
  spinning: boolean;
  onToggleSpin: () => void;
  flipped: boolean;
  onFlip: (flipped: boolean) => void;
  zoom: number;
  onZoom: (delta: number) => void;
  rpm: number;
  resetKey: number;
  onReset: () => void;
};

const SIDES = [
  { value: false, label: "Obverse" },
  { value: true, label: "Reverse" },
];

export function DetailDrawer({
  open,
  item,
  config,
  onClose,
  onPrev,
  onNext,
  onConfigure,
  spinning,
  onToggleSpin,
  flipped,
  onFlip,
  zoom,
  onZoom,
  rpm,
  resetKey,
  onReset,
}: DetailDrawerProps) {
  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={cx(
          "fixed inset-0 z-40 bg-ink/6 transition-opacity duration-300",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />
      <aside
        aria-hidden={!open}
        inert={!open}
        className={cx(
          "fixed bottom-0 right-0 top-0 z-41 box-border flex w-[45vw] min-w-[min(100vw,440px)] flex-col overflow-y-auto border-l border-line bg-paper transition-transform duration-450 ease-drawer",
          open ? "translate-x-0" : "translate-x-[101%]",
        )}
      >
        <div className="flex items-center gap-1.5 border-b border-line px-7 py-3.5">
          <div className="mr-auto mono text-cell">{item.id}</div>
          <Button onClick={onConfigure}>Configure · E</Button>
          <Button onClick={onPrev}>↑ Prev</Button>
          <Button onClick={onNext}>↓ Next</Button>
          <Button onClick={onClose}>Close · Esc</Button>
        </div>
        <div className="flex flex-col gap-1.5 px-7 pb-[18px] pt-[22px]">
          <div className="mono text-tag uppercase tracking-label text-muted">
            {KIND_LABEL[item.kind]} · {item.origin} · {item.year}
          </div>
          <h2 className="text-display font-medium leading-[1.1] tracking-display text-pretty">
            {item.title}
          </h2>
        </div>
        <div className="relative mx-7 h-[52vh] min-h-80 flex-none rounded-xs bg-surface">
          <Artifact
            {...artifactProps(item, config)}
            mode="orbit"
            rotating={open && spinning}
            flipped={flipped}
            zoom={zoom}
            rpm={rpm}
            resetKey={resetKey}
            onZoom={(direction) => onZoom(direction * 0.1)}
            fit={290}
          />
          <div className="pointer-events-none absolute left-3.5 top-3 mono text-tag text-faint">
            ortho · drag · scroll
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2">
            <Button onClick={onToggleSpin}>
              {spinning ? "❚❚ Pause" : "▶ Orbit"} · {rpm} RPM
            </Button>
            <SegmentedControl
              framed
              options={SIDES}
              value={flipped}
              onChange={onFlip}
            />
            <div className="ml-auto flex items-center rounded-xs border border-line bg-paper">
              <button
                type="button"
                aria-label="zoom out"
                onClick={() => onZoom(-0.2)}
                className="h-[26px] w-7 cursor-pointer border-0 bg-transparent font-mono text-row text-ink hover:bg-raised"
              >
                −
              </button>
              <div className="w-11 text-center mono text-control">
                {Math.round(zoom * 100)}%
              </div>
              <button
                type="button"
                aria-label="zoom in"
                onClick={() => onZoom(0.2)}
                className="h-[26px] w-7 cursor-pointer border-0 bg-transparent font-mono text-row text-ink hover:bg-raised"
              >
                +
              </button>
            </div>
            <Button onClick={onReset}>Reset</Button>
          </div>
        </div>
        <div className="px-7 pb-12 pt-6">
          <SectionLabel className="pb-2.5">Specification</SectionLabel>
          {specRows(item).map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[140px_minmax(0,1fr)] items-baseline gap-4 border-b border-line py-[9px]"
            >
              <div className="mono text-tag uppercase tracking-spec text-muted">
                {row.label}
              </div>
              <div className="mono text-cell">{row.value}</div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
