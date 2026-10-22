import {
  CARD_CHIP_MM,
  perforationGrid,
  perforationPitch,
} from "../../../components/artifact/geometry";
import type { FaceSide, Geometry } from "../../../components/artifact/types";
import type { CatalogItem } from "../catalog";

const DPI = 600;
const PAD_MM = 6;
const FOOTER_MM = 7;
const PAPER = "#F5F4F0";
const CLAY = "#E6E5E0";
const INK = "#161615";
const MUTED = "#6E6D6A";

export function templateDimensions(item: CatalogItem, geo: Geometry) {
  return item.kind === "coin"
    ? [geo.dia ?? 24, geo.dia ?? 24]
    : [geo.w ?? 0, geo.h ?? 0];
}

export function downloadTemplate(
  item: CatalogItem,
  geo: Geometry,
  side: FaceSide,
) {
  const kind = item.kind;
  const [widthMm, heightMm] = templateDimensions(item, geo);
  const ppm = DPI / 25.4;
  const canvasWidth = Math.round((widthMm + PAD_MM * 2) * ppm);
  const canvasHeight = Math.round((heightMm + PAD_MM * 2 + FOOTER_MM) * ppm);
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const ox = PAD_MM * ppm;
  const oy = PAD_MM * ppm;
  const w = widthMm * ppm;
  const h = heightMm * ppm;

  const outline = (inset = 0) => {
    ctx.beginPath();
    if (kind === "coin")
      ctx.arc(ox + w / 2, oy + h / 2, w / 2 - inset, 0, Math.PI * 2);
    else if (kind === "card")
      ctx.roundRect(
        ox + inset,
        oy + inset,
        w - inset * 2,
        h - inset * 2,
        Math.max(0, (geo.r ?? 0) * ppm - inset),
      );
    else ctx.rect(ox + inset, oy + inset, w - inset * 2, h - inset * 2);
  };

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.fillStyle = CLAY;
  outline();
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  outline();
  ctx.stroke();

  let safe = 3 * ppm;
  if (kind === "coin") safe = (geo.bevel ?? 1) * ppm;
  if (kind === "stamp") {
    const gauge = geo.perf ?? 14;
    const { columns, rows, stepX, stepY, radius } = perforationGrid(
      w,
      h,
      gauge,
      geo.hole ?? 0.55,
      ppm,
    );
    const hole = (cx: number, cy: number) => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = PAPER;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };
    for (let i = 0; i <= columns; i++) {
      hole(ox + i * stepX, oy);
      hole(ox + i * stepX, oy + h);
    }
    for (let j = 1; j < rows; j++) {
      hole(ox, oy + j * stepY);
      hole(ox + w, oy + j * stepY);
    }
    safe = ((geo.margin ?? 1.6) + perforationPitch(gauge) / 2) * ppm;
  }

  ctx.setLineDash([14, 9]);
  ctx.strokeStyle = MUTED;
  ctx.lineWidth = 1.5;
  outline(safe);
  ctx.stroke();

  if (kind === "card" && geo.chip !== false) {
    ctx.setLineDash([]);
    ctx.strokeStyle = INK;
    ctx.beginPath();
    ctx.roundRect(
      ox + (geo.chipX ?? 0) * ppm,
      oy + (geo.chipY ?? 0) * ppm,
      CARD_CHIP_MM.w * ppm,
      CARD_CHIP_MM.h * ppm,
      CARD_CHIP_MM.r * ppm,
    );
    ctx.stroke();
  }

  ctx.setLineDash([]);
  ctx.strokeStyle = "rgba(22,22,21,0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(ox + w / 2, oy - 3 * ppm);
  ctx.lineTo(ox + w / 2, oy + h + 3 * ppm);
  ctx.moveTo(ox - 3 * ppm, oy + h / 2);
  ctx.lineTo(ox + w + 3 * ppm, oy + h / 2);
  ctx.stroke();

  ctx.fillStyle = INK;
  ctx.font = `${Math.round(2.1 * ppm)}px "Geist Mono", ui-monospace, monospace`;
  const dims =
    kind === "coin"
      ? `Ø ${widthMm.toFixed(2)} mm`
      : `${widthMm.toFixed(2)} × ${heightMm.toFixed(2)} mm`;
  const sideLabel = side === "obv" ? "OBVERSE" : "REVERSE";
  ctx.fillText(
    `${item.id} · ${sideLabel} · ${dims} · ${DPI} dpi`,
    ox,
    canvasHeight - 3 * ppm,
  );

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `${item.id}-${side}-template.png`;
  link.click();
}
