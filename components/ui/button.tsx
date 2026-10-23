import type { ComponentProps } from "react";
import { cx } from "./cx";

export type ButtonVariant = "outline" | "primary";
export type ButtonSize = "sm" | "adaptive";

const BASE =
  "inline-flex cursor-pointer items-center whitespace-nowrap rounded-xs border px-2.5 mono text-control";

const SIZE: Record<ButtonSize, string> = {
  sm: "h-7",
  adaptive: "h-10 regular:h-7",
};

const VARIANT: Record<ButtonVariant, string> = {
  outline: "border-line bg-paper text-ink hover:bg-raised",
  primary: "border-ink bg-ink text-paper hover:bg-ink-hover",
};

export function buttonShape(size: ButtonSize = "sm") {
  return cx(BASE, SIZE[size]);
}

export function buttonClass(
  variant: ButtonVariant = "outline",
  size: ButtonSize = "sm",
) {
  return cx(buttonShape(size), VARIANT[variant]);
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant = "outline",
  size = "sm",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(buttonClass(variant, size), className)}
      {...props}
    />
  );
}
