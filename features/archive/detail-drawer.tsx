import { type PointerEvent, useRef } from "react";
import { Artifact } from "../../components/artifact/artifact";
import { Button } from "../../components/ui/button";
import { cx } from "../../components/ui/cx";
import { SectionLabel } from "../../components/ui/section-label";
import { SegmentedControl } from "../../components/ui/segmented-control";
import { useDictionary } from "../../i18n/locale-provider";
import { artifactProps } from "./artifact-config";
import { type CatalogItem, itemYear } from "./catalog";
import { specRows } from "./columns";

export const ZOOM_MIN = 0.6;
export const ZOOM_MAX = 2.4;

type DetailDrawerProps = {
  open: boolean;
  compact: boolean;
  backLabel: string;
  position: string;
  item: CatalogItem;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
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

const EDGE_SWIPE_ZONE = 18;
const SWIPE_CLOSE_DISTANCE = 140;
const SWIPE_CLOSE_RATIO = 0.3;

const TEXT_BUTTON =
  "cursor-pointer whitespace-nowrap border-0 bg-transparent text-touch tracking-ui text-ink";
const TOUCH_TILE =
  "box-border flex-none cursor-pointer rounded-xs border border-line bg-paper font-mono text-ink";

export function DetailDrawer({
  open,
  compact,
  backLabel,
  position,
  item,
  onClose,
  onPrev,
  onNext,
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
  const asideRef = useRef<HTMLElement>(null);
  const swipe = useRef<{ x: number; dx: number } | null>(null);
  const dict = useDictionary();
  const text = dict.drawer;
  const sides = [
    { value: false, label: dict.side.obv },
    { value: true, label: dict.side.rev },
  ];

  const onSwipeStart = (event: PointerEvent<HTMLElement>) => {
    const aside = asideRef.current;
    if (!compact || !open || !aside) return;
    if (event.clientX - aside.getBoundingClientRect().left > EDGE_SWIPE_ZONE)
      return;
    swipe.current = { x: event.clientX, dx: 0 };
    try {
      aside.setPointerCapture(event.pointerId);
    } catch {}
    aside.style.transition = "none";
  };
  const onSwipeMove = (event: PointerEvent<HTMLElement>) => {
    const aside = asideRef.current;
    if (!swipe.current || !aside) return;
    swipe.current.dx = Math.max(0, event.clientX - swipe.current.x);
    aside.style.transform = `translateX(${swipe.current.dx}px)`;
  };
  const onSwipeEnd = () => {
    const aside = asideRef.current;
    const gesture = swipe.current;
    if (!gesture || !aside) return;
    swipe.current = null;
    const dismiss =
      gesture.dx > aside.clientWidth * SWIPE_CLOSE_RATIO ||
      gesture.dx > SWIPE_CLOSE_DISTANCE;
    aside.style.transition = "";
    aside.style.transform = dismiss ? "translateX(101%)" : "";
    if (dismiss) {
      onClose();
      requestAnimationFrame(() => {
        aside.style.transform = "";
      });
    }
  };

  const padX = compact ? "px-4" : "px-7";

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={cx(
          "fixed inset-0 z-40 transition-opacity duration-300",
          compact ? "bg-transparent" : "bg-ink/6",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />
      <aside
        ref={asideRef}
        aria-hidden={!open}
        inert={!open}
        onPointerDown={onSwipeStart}
        onPointerMove={onSwipeMove}
        onPointerUp={onSwipeEnd}
        onPointerCancel={onSwipeEnd}
        className={cx(
          "fixed bottom-0 right-0 top-0 z-41 box-border flex flex-col bg-paper transition-transform duration-450 ease-drawer",
          compact
            ? "w-full touch-pan-y shadow-page"
            : "w-[45vw] min-w-[min(100vw,440px)] border-l border-line max-[1100px]:w-[62vw]",
          open ? "translate-x-0" : "translate-x-[101%]",
        )}
      >
        {compact ? (
          <div className="flex-none border-b border-line pt-safe">
            <div className="grid h-11 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-1">
              <button
                type="button"
                onClick={onClose}
                className={cx(
                  TEXT_BUTTON,
                  "flex h-11 items-center gap-[3px] justify-self-start pl-2 pr-2.5",
                )}
              >
                <span className="-mt-[3px] text-[26px] leading-none">‹</span>
                {backLabel}
              </button>
              <div className="whitespace-nowrap mono text-cell">{item.id}</div>
            </div>
          </div>
        ) : (
          <div className="flex flex-none items-center gap-1.5 border-b border-line px-7 py-3.5">
            <div className="mr-auto flex h-[30px] items-center mono text-cell">
              {item.id}
            </div>
            <Button onClick={onPrev}>↑ {text.prev}</Button>
            <Button onClick={onNext}>↓ {text.next}</Button>
            <Button onClick={onClose}>{text.close} · Esc</Button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div
            className={cx("flex flex-col gap-1.5 pb-[18px] pt-[22px]", padX)}
          >
            <div className="mono text-tag uppercase tracking-label text-muted">
              {dict.kind[item.kind]} · {item.origin} · {itemYear(item)}
            </div>
            <h2
              className={cx(
                "font-medium leading-[1.1] tracking-display text-pretty",
                compact ? "text-[26px]" : "text-display",
              )}
            >
              {item.title}
            </h2>
          </div>
          <div
            className={cx(
              "relative flex-none rounded-xs bg-surface",
              compact ? "mx-4 h-[44vh] min-h-70" : "mx-7 h-[52vh] min-h-80",
            )}
          >
            <Artifact
              {...artifactProps(item)}
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
              {compact ? text.hintTouch : text.hintPointer}
            </div>
            {!compact && (
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2">
                <Button onClick={onToggleSpin}>
                  {spinning ? `❚❚ ${text.pause}` : `▶ ${text.orbit}`} · {rpm}{" "}
                  RPM
                </Button>
                <SegmentedControl
                  framed
                  options={sides}
                  value={flipped}
                  onChange={onFlip}
                />
                <div className="ml-auto flex items-center rounded-xs border border-line bg-paper">
                  <button
                    type="button"
                    aria-label={text.zoomOut}
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
                    aria-label={text.zoomIn}
                    onClick={() => onZoom(0.2)}
                    className="h-[26px] w-7 cursor-pointer border-0 bg-transparent font-mono text-row text-ink hover:bg-raised"
                  >
                    +
                  </button>
                </div>
                <Button onClick={onReset}>{text.reset}</Button>
              </div>
            )}
          </div>
          {compact && (
            <div className="flex items-center gap-2 px-4 pt-2.5">
              <button
                type="button"
                aria-label={text.toggleOrbit}
                onClick={onToggleSpin}
                className={cx(TOUCH_TILE, "h-10 w-11 text-xs")}
              >
                {spinning ? "❚❚" : "▶"}
              </button>
              <SegmentedControl
                size="fill"
                options={sides}
                value={flipped}
                onChange={onFlip}
              />
              <div className="flex flex-none items-center rounded-xs border border-line">
                <button
                  type="button"
                  aria-label={text.zoomOut}
                  onClick={() => onZoom(-0.2)}
                  className="size-[38px] cursor-pointer border-0 bg-transparent font-mono text-[15px] text-ink"
                >
                  −
                </button>
                <div className="w-[42px] text-center mono text-control">
                  {Math.round(zoom * 100)}%
                </div>
                <button
                  type="button"
                  aria-label={text.zoomIn}
                  onClick={() => onZoom(0.2)}
                  className="size-[38px] cursor-pointer border-0 bg-transparent font-mono text-[15px] text-ink"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                aria-label={text.resetView}
                onClick={onReset}
                className={cx(TOUCH_TILE, "size-10 text-[15px]")}
              >
                ↺
              </button>
            </div>
          )}
          <div className={cx("pb-12 pt-6", padX)}>
            <SectionLabel className="pb-2.5">{text.specification}</SectionLabel>
            {specRows(item, dict).map((row) => (
              <div
                key={row.label}
                className={cx(
                  "grid items-baseline gap-4 border-b border-line",
                  compact
                    ? "grid-cols-[112px_minmax(0,1fr)] py-3"
                    : "grid-cols-[140px_minmax(0,1fr)] py-[9px]",
                )}
              >
                <div className="mono text-tag uppercase tracking-spec text-muted">
                  {row.label}
                </div>
                <div className="mono text-cell">{row.value}</div>
              </div>
            ))}
          </div>
        </div>
        {compact && (
          <div className="grid flex-none grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center border-t border-line bg-paper/94 px-1 pb-safe">
            <button
              type="button"
              onClick={onPrev}
              className={cx(TEXT_BUTTON, "h-[50px] justify-self-start px-3.5")}
            >
              ‹ {text.prev}
            </button>
            <div className="whitespace-nowrap mono text-xs text-muted">
              {position}
            </div>
            <button
              type="button"
              onClick={onNext}
              className={cx(TEXT_BUTTON, "h-[50px] justify-self-end px-3.5")}
            >
              {text.next} ›
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
