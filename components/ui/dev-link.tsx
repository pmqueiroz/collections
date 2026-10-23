import Link from "next/link";
import type { ComponentProps } from "react";
import { type ButtonSize, buttonShape } from "./button";
import { cx } from "./cx";

type DevLinkProps = ComponentProps<typeof Link> & { size?: ButtonSize };

export function devButtonClass(size: ButtonSize = "sm") {
  return cx(
    buttonShape(size),
    "border-dev-line bg-dev text-ink no-underline hover:bg-dev-hover hover:text-ink!",
  );
}

export function DevLink({ size, className, ...props }: DevLinkProps) {
  return <Link className={cx(devButtonClass(size), className)} {...props} />;
}
