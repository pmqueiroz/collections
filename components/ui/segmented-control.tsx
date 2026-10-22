import type { ReactNode } from "react";
import { cx } from "./cx";

export type SegmentedSize = "sm" | "md" | "lg";

type Option<T> = { value: T; label: ReactNode };

type SegmentedControlProps<T> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: SegmentedSize;
  framed?: boolean;
  className?: string;
};

const SIZE: Record<SegmentedSize, { frame: string; item: string }> = {
  sm: {
    frame: "rounded-xs",
    item: "h-[22px] rounded-[1px] px-[9px] mono text-control",
  },
  md: {
    frame: "rounded-xs",
    item: "h-6 gap-1.5 rounded-[1px] px-[9px] mono text-control",
  },
  lg: {
    frame: "rounded-[3px]",
    item: "h-[26px] rounded-xs px-[11px] text-row tracking-ui",
  },
};

export function SegmentedControl<T extends string | boolean>({
  options,
  value,
  onChange,
  size = "sm",
  framed = false,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cx(
        "flex gap-0.5 p-0.5",
        SIZE[size].frame,
        framed ? "border border-line bg-paper" : "bg-surface",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cx(
              "flex cursor-pointer items-center whitespace-nowrap border-0",
              SIZE[size].item,
              active ? "bg-ink text-paper" : "bg-transparent text-muted",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
