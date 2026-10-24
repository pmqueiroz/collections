import { Lockup } from "../../components/brand/lockup";
import { Button } from "../../components/ui/button";
import { DevLink } from "../../components/ui/dev-link";
import { SegmentedControl } from "../../components/ui/segmented-control";
import { TabButton } from "../../components/ui/tab-button";
import { useDictionary, useLocale } from "../../i18n/locale-provider";
import { LocaleSwitch } from "../../i18n/locale-switch";
import { localePath } from "../../i18n/locales";
import { DOMAINS, type Domain, SORTS, type SortKey } from "./catalog";
import type { SortDirection } from "./query";

export type View = "list" | "grid";

type HeaderProps = {
  shown: number;
  total: number;
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
  onTextureEditor: () => void;
};

export function sortArrow(
  key: SortKey,
  sort: SortKey,
  direction: SortDirection,
) {
  if (key !== sort) return "";
  return direction > 0 ? "↑" : "↓";
}

export function Header({
  shown,
  total,
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
  onTextureEditor,
}: HeaderProps) {
  const dict = useDictionary();
  const locale = useLocale();
  const views: { value: View; label: string }[] = [
    { value: "grid", label: dict.header.gridView },
    { value: "list", label: dict.header.listView },
  ];
  return (
    <header className="sticky top-0 z-20 hidden border-b border-line bg-paper pt-safe regular:block">
      <div className="flex flex-wrap items-center gap-x-7 gap-y-3 px-7 py-3.5">
        <div className="flex items-center gap-2.5">
          <h1>
            <Lockup name={dict.site.name} size={16} />
          </h1>
          <div className="mono text-control text-faint">
            {shown} / {total}
          </div>
        </div>

        <nav className="flex gap-0.5">
          {DOMAINS.map((option) => (
            <TabButton
              key={option}
              active={domain === option}
              onClick={() => onDomain(option)}
            >
              <span className="flex items-baseline gap-1.5">
                <span>{dict.domain[option]}</span>
                <span className="mono text-meta text-faint">
                  {counts[option]}
                </span>
              </span>
            </TabButton>
          ))}
        </nav>

        <div className="flex items-center gap-0.5">
          <div className="pr-2 mono text-meta text-faint">
            {dict.header.sort}
          </div>
          {SORTS.map((option) => (
            <TabButton
              key={option}
              active={sort === option}
              onClick={() => onSort(option)}
              className="items-center gap-1 px-[9px]"
            >
              <span>{dict.sort[option]}</span>
              <span className="w-2 mono text-meta">
                {sortArrow(option, sort, direction)}
              </span>
            </TabButton>
          ))}
          <input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder={dict.header.search}
            aria-label={dict.header.search}
            spellCheck={false}
            className="ml-2.5 box-border h-[30px] w-[200px] rounded-xs border border-line bg-surface px-2.5 mono text-xs text-ink outline-none"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {process.env.NODE_ENV === "development" && (
            <DevLink href={localePath(locale, "/relics/new")}>
              + New entry
            </DevLink>
          )}
          <Button onClick={onTextureEditor}>{dict.header.textureEditor}</Button>
          <SegmentedControl
            size="lg"
            options={views}
            value={view}
            onChange={onView}
          />
          <LocaleSwitch size="lg" />
        </div>
      </div>
    </header>
  );
}
