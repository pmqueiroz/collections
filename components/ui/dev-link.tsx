import type { ComponentProps } from "react";
import { type ButtonSize, buttonShape } from "./button";
import { cx } from "./cx";
import { SearchLink } from "./search-link";

type DevLinkProps = ComponentProps<typeof SearchLink> & { size?: ButtonSize };

export function devButtonClass(size: ButtonSize = "sm") {
  return cx(
    buttonShape(size),
    "border-dev-line bg-dev text-ink no-underline hover:bg-dev-hover hover:text-ink!",
  );
}

export function DevLink({ size, className, ...props }: DevLinkProps) {
  return (
    <SearchLink className={cx(devButtonClass(size), className)} {...props} />
  );
}
