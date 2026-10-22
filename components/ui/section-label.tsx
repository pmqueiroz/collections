import type { ReactNode } from "react";
import { cx } from "./cx";

export function SectionLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "border-b border-line mono text-tag uppercase tracking-label text-faint",
        className,
      )}
    >
      {children}
    </div>
  );
}
