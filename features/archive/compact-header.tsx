import { cx } from "../../components/ui/cx";
import { DevLink } from "../../components/ui/dev-link";
import { SegmentedControl } from "../../components/ui/segmented-control";
import { useDictionary } from "../../i18n/locale-provider";
import { useLocaleSwitch } from "../../i18n/locale-switch";
import { type Locale, localePath } from "../../i18n/locales";
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
  const dict = useDictionary();
  const localeSwitch = useLocaleSwitch();
  const views: { value: View; label: string }[] = [
    { value: "list", label: dict.header.list },
    { value: "grid", label: dict.header.grid },
  ];
  return (
    <header className="sticky top-0 z-20 border-b border-line pt-safe glass regular:hidden">
      <div className="flex items-center gap-2.5 px-4 pb-0.5 pt-2">
        <div className="flex min-w-0 items-baseline gap-2">
          <h1 className="whitespace-nowrap text-display font-semibold tracking-title">
            {domainTitle(domain, dict)}
          </h1>
          <div className="mono text-xs text-faint">{shown}</div>
        </div>
        <SegmentedControl
          className="ml-auto"
          size="touch"
          options={views}
          value={view}
          onChange={onView}
        />
        <button
          type="button"
          onClick={onTextureEditor}
          aria-label={dict.header.textureEditor}
          className={cx(
            CONTROL,
            "cursor-pointer whitespace-nowrap px-3 text-sm",
          )}
        >
          {dict.header.editor}
        </button>
        {process.env.NODE_ENV === "development" && (
          <DevLink
            size="adaptive"
            href={localePath(localeSwitch.locale, "/relics/new")}
            aria-label="New entry"
            className="flex-none"
          >
            +
          </DevLink>
        )}
      </div>
      <div className="flex gap-2 px-4 pb-3 pt-2">
        <input
          type="search"
          enterKeyHint="search"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder={dict.header.search}
          aria-label={dict.header.search}
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
          <span className="mono text-meta text-faint">{dict.header.sort}</span>
          <span>{dict.sort[sort]}</span>
          <select
            value={sort}
            onChange={(event) => onSortKey(event.target.value as SortKey)}
            aria-label={dict.header.sortBy}
            className="absolute inset-0 size-full cursor-pointer opacity-0 text-touch"
          >
            {SORTS.map((option) => (
              <option key={option} value={option}>
                {dict.sort[option]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={onToggleDirection}
          aria-label={dict.header.reverseOrder}
          className={cx(CONTROL, "w-10 cursor-pointer mono text-sm")}
        >
          {direction > 0 ? "↑" : "↓"}
        </button>
        <label
          className={cx(
            CONTROL,
            "relative flex w-11 cursor-pointer items-center justify-center mono text-sm",
          )}
        >
          {localeSwitch.short}
          <select
            value={localeSwitch.locale}
            onChange={(event) =>
              localeSwitch.change(event.target.value as Locale)
            }
            aria-label={localeSwitch.label}
            className="absolute inset-0 size-full cursor-pointer opacity-0 text-touch"
          >
            {localeSwitch.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
  );
}
