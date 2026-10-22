import { SegmentedControl } from "../../components/ui/segmented-control";
import { TabButton } from "../../components/ui/tab-button";
import { DOMAINS, type Domain, SORTS, type SortKey } from "./catalog";
import type { SortDirection } from "./query";

export type View = "list" | "grid";

type HeaderProps = {
  shown: number;
  total: number;
  authed: boolean;
  onSignOut: () => void;
  domain: Domain;
  counts: Record<Domain, number>;
  onDomain: (domain: Domain) => void;
  sort: SortKey;
  direction: SortDirection;
  onSort: (sort: SortKey) => void;
  query: string;
  onQuery: (query: string) => void;
  view: View;
  onView: (view: View) => void;
};

export function sortArrow(
  key: SortKey,
  sort: SortKey,
  direction: SortDirection,
) {
  if (key !== sort) return "";
  return direction > 0 ? "↑" : "↓";
}

const VIEWS: { value: View; label: string }[] = [
  { value: "list", label: "Index List" },
  { value: "grid", label: "Artifact Grid" },
];

export function Header({
  shown,
  total,
  authed,
  onSignOut,
  domain,
  counts,
  onDomain,
  sort,
  direction,
  onSort,
  query,
  onQuery,
  view,
  onView,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper">
      <div className="flex flex-wrap items-center gap-x-7 gap-y-3 px-7 py-3.5">
        <div className="flex items-baseline gap-2.5">
          <h1 className="text-sm font-semibold">Master Index</h1>
          <div className="mono text-control text-faint">
            {shown} / {total}
          </div>
          {authed && (
            <button
              type="button"
              onClick={onSignOut}
              aria-label="end session"
              className="size-1.5 cursor-pointer self-center rounded-full border-0 bg-ink p-0"
            />
          )}
        </div>

        <nav className="flex gap-0.5">
          {DOMAINS.map((option) => (
            <TabButton
              key={option.value}
              active={domain === option.value}
              onClick={() => onDomain(option.value)}
            >
              <span>{option.label}</span>
              <span className="mono text-meta text-faint">
                {counts[option.value]}
              </span>
            </TabButton>
          ))}
        </nav>

        <div className="flex items-center gap-0.5">
          <div className="pr-2 mono text-meta text-faint">Sort</div>
          {SORTS.map((option) => (
            <TabButton
              key={option.value}
              active={sort === option.value}
              onClick={() => onSort(option.value)}
              className="items-center gap-1 px-[9px]"
            >
              <span>{option.label}</span>
              <span className="w-2 mono text-meta">
                {sortArrow(option.value, sort, direction)}
              </span>
            </TabButton>
          ))}
          <input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Search catalog"
            aria-label="Search catalog"
            spellCheck={false}
            className="ml-2.5 box-border h-[30px] w-[200px] rounded-xs border border-line bg-surface px-2.5 mono text-xs text-ink outline-none"
          />
        </div>

        <SegmentedControl
          className="ml-auto"
          size="lg"
          options={VIEWS}
          value={view}
          onChange={onView}
        />
      </div>
    </header>
  );
}
