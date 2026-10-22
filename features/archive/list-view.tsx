import type { MouseEvent } from "react";
import { cx } from "../../components/ui/cx";
import type { CatalogItem, Domain, SortKey } from "./catalog";
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
  const gridTemplateColumns = `24px ${columns.map((column) => column.track).join(" ")}`;

  return (
    <main className="overflow-x-auto">
      <div style={{ minWidth: MIN_TABLE_WIDTH[domain] }}>
        <div
          className={cx(
            ROW,
            "h-9 mono text-tag uppercase tracking-label text-faint",
          )}
          style={{ gridTemplateColumns }}
        >
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
    </main>
  );
}
