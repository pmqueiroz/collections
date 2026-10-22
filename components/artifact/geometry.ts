import type { Fit } from "./types";

export const DEFAULT_FIT: Fit = { s: 1, x: 0, y: 0, r: 0 };

export const CARD_CHIP_MM = { w: 12, h: 9.4, r: 1.2 };

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function round2(value: number) {
  return +value.toFixed(2);
}

export function fitTransform(fit?: Partial<Fit>) {
  return `translate(${fit?.x ?? 0}%, ${fit?.y ?? 0}%) rotate(${fit?.r ?? 0}deg) scale(${fit?.s ?? 1})`;
}

export function perforationPitch(gauge: number) {
  return 20 / gauge;
}

export function perforationGrid(
  width: number,
  height: number,
  gauge: number,
  holeRatio: number,
  scale: number,
) {
  const pitch = perforationPitch(gauge) * scale;
  const columns = Math.max(2, Math.round(width / pitch));
  const rows = Math.max(2, Math.round(height / pitch));
  const stepX = width / columns;
  const stepY = height / rows;
  const radius = (holeRatio * Math.min(stepX, stepY)) / 2;
  return { columns, rows, stepX, stepY, radius };
}

export function perforationMask(
  width: number,
  height: number,
  gauge: number,
  holeRatio: number,
  scale: number,
) {
  const { stepX, stepY, radius } = perforationGrid(
    width,
    height,
    gauge,
    holeRatio,
    scale,
  );
  return `radial-gradient(circle at 50% 50%, rgba(0,0,0,0) ${round2(radius)}px, #000 ${round2(radius + 0.5)}px) ${round2(-stepX / 2)}px ${round2(-stepY / 2)}px / ${round2(stepX)}px ${round2(stepY)}px repeat, linear-gradient(#000, #000) center / ${round2(width - stepX)}px ${round2(height - stepY)}px no-repeat`;
}
