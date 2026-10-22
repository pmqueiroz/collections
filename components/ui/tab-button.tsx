import type { ComponentProps } from "react";
import { cx } from "./cx";

type TabButtonProps = ComponentProps<"button"> & { active: boolean };

export function TabButton({ active, className, ...props }: TabButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cx(
        "flex h-[30px] cursor-pointer items-baseline gap-1.5 whitespace-nowrap rounded-xs border-0 px-2.5 text-nav tracking-ui hover:text-ink",
        active ? "bg-surface text-ink" : "bg-transparent text-muted",
        className,
      )}
      {...props}
    />
  );
}
