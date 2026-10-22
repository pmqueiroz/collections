import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { cx } from "../ui/cx";
import { fitTransform } from "./geometry";
import type { Fit } from "./types";

export const CLAY = "#E6E5E0";
export const CLAY_LINE = "#C2C1BC";

export function Sheen({
  strength,
  spread = "58%",
}: {
  strength: number;
  spread?: string;
}) {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `radial-gradient(circle at var(--sx, 32%) var(--sy, 26%), rgba(245,244,240,${strength}) 0%, rgba(245,244,240,0) ${spread})`,
      }}
    />
  );
}

export function ClayGrid({ cell }: { cell: [number, number] }) {
  return (
    <div
      className="absolute inset-0 opacity-75"
      style={{
        background: CLAY,
        backgroundImage: `linear-gradient(${CLAY_LINE} 1px, rgba(0,0,0,0) 1px), linear-gradient(90deg, ${CLAY_LINE} 1px, rgba(0,0,0,0) 1px)`,
        backgroundSize: `${cell[0]}px ${cell[1]}px`,
      }}
    />
  );
}

export function ClayWell({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cx("absolute", className)}
      style={{
        background: "#DFDED9",
        boxShadow:
          "inset 1px 1px 2px rgba(22,22,21,0.18), inset -1px -1px 1px rgba(245,244,240,0.9)",
        ...style,
      }}
    />
  );
}

export function FaceImage({
  src,
  fit,
  backing,
}: {
  src: string;
  fit?: Fit;
  backing: string;
}) {
  return (
    <>
      <div className="absolute inset-0" style={{ background: backing }} />
      <Image
        src={src}
        alt=""
        fill
        unoptimized
        draggable={false}
        className="object-cover"
        style={{ transform: fitTransform(fit) }}
      />
    </>
  );
}

export function MonoText({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cx("font-mono whitespace-nowrap text-muted", className)}
      style={style}
    >
      {children}
    </div>
  );
}
