import type { MouseEvent } from "react";
import { cx } from "../../components/ui/cx";
import {
  amountLabel,
  type CatalogItem,
  type Domain,
  itemSubtitle,
  type SortKey,
} from "./catalog";
import { CELL_CLASS, COLUMNS, cellValue, MIN_TABLE_WIDTH } from "./columns";
import { sortArrow } from "./header";
import type { SortDirection } from "./query";
import { Silhouette } from "./silhouette";

type ListViewProps = {
  items: CatalogItem[];
  domain: Domain;
  sort: SortKey;
  direction: SortDirection;
  onSort: (sort: SortKey) => void;
  selectedId: string | null;
  rowHeight: number;
  onOpen: (id: string) => void;
  onHover: (id: string, event: MouseEvent) => void;
  onUnhover: () => void;
};

const ROW = "grid items-center gap-[18px] border-b border-line px-7";
const AMOUNT = "mono text-cell text-muted text-right tabular-nums";

export function ListView({
  items,
  domain,
  sort,
  direction,
  onSort,
  selectedId,
  rowHeight,
  onOpen,
  onHover,
  onUnhover,
}: ListViewProps) {
  const columns = COLUMNS[domain];
  const gridTemplateColumns = `32px 24px ${columns.map((column) => column.track).join(" ")}`;

  return (
    <main>
      <div className="pb-[calc(env(safe-area-inset-bottom)+72px)] regular:hidden">
        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => onOpen(item.id)}
            className={cx(
              "box-border flex min-h-16 w-full cursor-pointer items-center gap-3.5 border-x-0 border-t-0 border-b border-line py-2.5 pl-4 pr-2 text-left active:bg-surface",
              selectedId === item.id ? "bg-raised" : "bg-transparent",
            )}
          >
            <div className={cx(AMOUNT, "w-8 flex-none")}>
              {amountLabel(item)}
            </div>
            <div className="flex size-10 flex-none items-center justify-center rounded-xs bg-surface">
              <Silhouette kind={item.kind} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="mono text-meta text-muted">{item.id}</div>
              <div className="truncate text-[15.5px] font-medium">
                {item.title}
              </div>
              <div className="truncate mono text-control text-muted">
                {itemSubtitle(item)}
              </div>
            </div>
            <div className="w-6 flex-none text-center text-xl text-faint">
              ›
            </div>
          </button>
        ))}
      </div>
      <div className="hidden overflow-x-auto regular:block">
        <div style={{ minWidth: MIN_TABLE_WIDTH[domain] }}>
          <div
            className={cx(
              ROW,
              "h-9 mono text-tag uppercase tracking-label text-faint",
            )}
            style={{ gridTemplateColumns }}
          >
            <div />
            <div />
            {columns.map((column) => {
              const sortKey = column.sort;
              const arrow = sortKey ? sortArrow(sortKey, sort, direction) : "";
              const label = `${column.label}${arrow ? ` ${arrow}` : ""}`;
              const align = column.type === "num" ? "text-right" : "text-left";
              if (!sortKey)
                return (
                  <div key={column.field} className={cx("truncate", align)}>
                    {label}
                  </div>
                );
              return (
                <button
                  type="button"
                  key={column.field}
                  onClick={() => onSort(sortKey)}
                  className={cx(
                    "cursor-pointer truncate border-0 bg-transparent p-0 uppercase tracking-label",
                    align,
                    sort === sortKey ? "text-ink" : "text-faint",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {items.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => onOpen(item.id)}
              onMouseEnter={(event) => onHover(item.id, event)}
              onMouseMove={(event) => onHover(item.id, event)}
              onMouseLeave={onUnhover}
              className={cx(
                ROW,
                "w-full cursor-pointer border-x-0 border-t-0 text-left hover:bg-surface",
                selectedId === item.id ? "bg-raised" : "bg-transparent",
              )}
              style={{ gridTemplateColumns, height: rowHeight }}
            >
              <div className={AMOUNT}>{amountLabel(item)}</div>
              <Silhouette kind={item.kind} />
              {columns.map((column) => (
                <div
                  key={column.field}
                  className={cx(
                    "min-w-0 truncate tabular-nums",
                    CELL_CLASS[column.type],
                  )}
                >
                  {cellValue(item, column.field)}
                </div>
              ))}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
