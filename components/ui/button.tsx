import type { ComponentProps } from "react";
import { cx } from "./cx";

export type ButtonVariant = "outline" | "primary";

const BASE =
  "inline-flex h-7 cursor-pointer items-center whitespace-nowrap rounded-xs border px-2.5 mono text-control";

const VARIANT: Record<ButtonVariant, string> = {
  outline: "border-line bg-paper text-ink hover:bg-raised",
  primary: "border-ink bg-ink text-paper hover:bg-ink-hover",
};

export function buttonClass(variant: ButtonVariant = "outline") {
  return cx(BASE, VARIANT[variant]);
}

type ButtonProps = ComponentProps<"button"> & { variant?: ButtonVariant };

export function Button({
  variant = "outline",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(buttonClass(variant), className)}
      {...props}
    />
  );
}
