import { cx } from "../../components/ui/cx";
import { SegmentedControl } from "../../components/ui/segmented-control";
import { type Domain, domainTitle, SORTS, type SortKey } from "./catalog";
import type { View } from "./header";
import type { SortDirection } from "./query";

type CompactHeaderProps = {
  domain: Domain;
  shown: number;
  view: View;
  onView: (view: View) => void;
  query: string;
  onQuery: (query: string) => void;
  sort: SortKey;
  direction: SortDirection;
  onSortKey: (sort: SortKey) => void;
  onToggleDirection: () => void;
  onTextureEditor: () => void;
};

const VIEWS: { value: View; label: string }[] = [
  { value: "list", label: "List" },
  { value: "grid", label: "Grid" },
];

const CONTROL =
  "box-border h-10 flex-none rounded-[3px] border border-line bg-paper text-ink";

export function CompactHeader({
  domain,
  shown,
  view,
  onView,
  query,
  onQuery,
  sort,
  direction,
  onSortKey,
  onToggleDirection,
  onTextureEditor,
}: CompactHeaderProps) {
  const sortLabel = SORTS.find((option) => option.value === sort)?.label;
  return (
    <header className="sticky top-0 z-20 border-b border-line pt-safe glass regular:hidden">
      <div className="flex items-center gap-2.5 px-4 pb-0.5 pt-2">
        <div className="flex min-w-0 items-baseline gap-2">
          <h1 className="whitespace-nowrap text-display font-semibold tracking-title">
            {domainTitle(domain)}
          </h1>
          <div className="mono text-xs text-faint">{shown}</div>
        </div>
        <SegmentedControl
          className="ml-auto"
          size="touch"
          options={VIEWS}
          value={view}
          onChange={onView}
        />
        <button
          type="button"
          onClick={onTextureEditor}
          aria-label="Texture editor"
          className={cx(
            CONTROL,
            "cursor-pointer whitespace-nowrap px-3 text-sm",
          )}
        >
          Editor
        </button>
      </div>
      <div className="flex gap-2 px-4 pb-3 pt-2">
        <input
          type="search"
          enterKeyHint="search"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search catalog"
          aria-label="Search catalog"
          spellCheck={false}
          autoComplete="off"
          className="box-border h-10 min-w-0 flex-1 appearance-none rounded-[3px] border border-line bg-surface px-3 mono text-touch text-ink outline-none"
        />
        <label
          className={cx(
            CONTROL,
            "relative flex cursor-pointer items-center gap-1.5 whitespace-nowrap px-3 text-sm",
          )}
        >
          <span className="mono text-meta text-faint">Sort</span>
          <span>{sortLabel}</span>
          <select
            value={sort}
            onChange={(event) => onSortKey(event.target.value as SortKey)}
            aria-label="Sort by"
            className="absolute inset-0 size-full cursor-pointer opacity-0 text-touch"
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={onToggleDirection}
          aria-label="Reverse order"
          className={cx(CONTROL, "w-10 cursor-pointer mono text-sm")}
        >
          {direction > 0 ? "↑" : "↓"}
        </button>
      </div>
    </header>
  );
}
