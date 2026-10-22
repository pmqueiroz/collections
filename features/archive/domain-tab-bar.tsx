import { cx } from "../../components/ui/cx";
import { DOMAINS, type Domain } from "./catalog";
import { DomainGlyph } from "./domain-glyph";

type DomainTabBarProps = {
  domain: Domain;
  onDomain: (domain: Domain) => void;
  className?: string;
};

export function DomainTabBar({
  domain,
  onDomain,
  className,
}: DomainTabBarProps) {
  return (
    <nav
      className={cx(
        "fixed bottom-0 left-0 right-0 z-25 grid grid-cols-5 border-t border-line pb-safe glass",
        className,
      )}
    >
      {DOMAINS.map((option) => {
        const active = option.value === domain;
        return (
          <button
            type="button"
            key={option.value}
            aria-pressed={active}
            onClick={() => onDomain(option.value)}
            className={cx(
              "flex h-[54px] cursor-pointer flex-col items-center justify-center gap-[5px] border-0 bg-transparent p-0 text-tag font-medium tracking-[-0.01em]",
              active ? "text-ink" : "text-faint",
            )}
          >
            <DomainGlyph domain={option.value} active={active} />
            <span>{option.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
