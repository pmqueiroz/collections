import {
  type CSSProperties,
  type PointerEvent,
  useEffect,
  useRef,
  useState,
  type WheelEvent,
} from "react";
import {
  CARD_CHIP_MM,
  clamp,
  perforationMask,
  perforationPitch,
  round2,
} from "../../../components/artifact/geometry";
import { FittedImage } from "../../../components/artifact/surfaces";
import type {
  ArtifactKind,
  Fit,
  Geometry,
} from "../../../components/artifact/types";
import { useDictionary } from "../../../i18n/locale-provider";
import { templateDimensions } from "./download-template";

const MAX_WIDTH = 330;
const MAX_HEIGHT = 220;
const SIDE_GUTTER = 76;

type FaceEditorProps = {
  kind: ArtifactKind;
  geo: Geometry;
  image: string;
  fit: Fit;
  sideLabel: string;
  hint: string;
  onFit: (patch: Partial<Fit>) => void;
  onFile: (file: File | undefined) => void;
};

function shape(
  kind: ArtifactKind,
  geo: Geometry,
  scale: number,
  width: number,
  height: number,
) {
  if (kind === "coin")
    return {
      radius: "50%",
      safe: (geo.bevel ?? 1) * scale,
      safeRadius: "50%",
      mask: "none",
    };
  if (kind === "card")
    return {
      radius: `${round2((geo.r ?? 0) * scale)}px`,
      safe: 3 * scale,
      safeRadius: `${round2(Math.max(0, (geo.r ?? 0) - 3) * scale)}px`,
      mask: "none",
    };
  if (kind === "stamp") {
    const gauge = geo.perf ?? 14;
    return {
      radius: "0px",
      safe: ((geo.margin ?? 1.6) + perforationPitch(gauge) / 2) * scale,
      safeRadius: "0px",
      mask: perforationMask(width, height, gauge, geo.hole ?? 0.55, scale),
    };
  }
  return { radius: "1px", safe: 3 * scale, safeRadius: "0px", mask: "none" };
}

export function FaceEditor({
  kind,
  geo,
  image,
  fit,
  sideLabel,
  hint,
  onFit,
  onFile,
}: FaceEditorProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [maxWidth, setMaxWidth] = useState(MAX_WIDTH);
  const dict = useDictionary();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new ResizeObserver(() =>
      setMaxWidth(
        Math.max(80, Math.min(MAX_WIDTH, section.clientWidth - SIDE_GUTTER)),
      ),
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const [widthMm, heightMm] = templateDimensions(kind, geo);
  const scale = Math.min(maxWidth / widthMm, MAX_HEIGHT / heightMm);
  const width = widthMm * scale;
  const height = heightMm * scale;
  const { radius, safe, safeRadius, mask } = shape(
    kind,
    geo,
    scale,
    width,
    height,
  );
  const pan = useRef<{ x: number; y: number; fx: number; fy: number } | null>(
    null,
  );
  const showChip = kind === "card" && geo.chip !== false;

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!image) return;
    pan.current = { x: event.clientX, y: event.clientY, fx: fit.x, fy: fit.y };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {}
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = pan.current;
    if (!start) return;
    onFit({
      x: round2(start.fx + ((event.clientX - start.x) / width) * 100),
      y: round2(start.fy + ((event.clientY - start.y) / height) * 100),
    });
  };
  const onPointerUp = () => {
    pan.current = null;
  };
  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!image) return;
    const factor = event.deltaY < 0 ? 1.04 : 1 / 1.04;
    onFit({ s: round2(clamp(fit.s * factor, 0.3, 3)) });
  };

  const surface: CSSProperties = {
    width: round2(width),
    height: round2(height),
    borderRadius: radius,
    WebkitMask: mask,
    mask,
    cursor: image ? "grab" : "default",
  };

  return (
    <section
      ref={sectionRef}
      aria-label={dict.editor.faceEditor(sideLabel)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onFile(event.dataTransfer.files?.[0]);
      }}
      className="relative flex flex-none items-center justify-center rounded-xs bg-surface px-4 pb-[34px] pt-7"
    >
      <div className="flex flex-col items-center gap-2">
        <div className="mono text-tag text-muted">
          {kind === "coin"
            ? `Ø ${widthMm.toFixed(2)} mm`
            : `${widthMm.toFixed(2)} mm`}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5" />
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={onWheel}
            className="relative flex-none touch-none overflow-hidden bg-[#E6E5E0] shadow-[inset_0_0_0_1px_#C2C1BC]"
            style={surface}
          >
            <div className="absolute inset-0 bg-[linear-gradient(#C2C1BC_1px,transparent_1px),linear-gradient(90deg,#C2C1BC_1px,transparent_1px)] bg-size-[20px_20px] opacity-60" />
            {image ? (
              <FittedImage
                src={image}
                fit={fit}
                className="pointer-events-none"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center mono text-meta text-faint">
                {dict.editor.dropImage}
              </div>
            )}
            <div
              className="pointer-events-none absolute border border-dashed border-ink/38"
              style={{ inset: round2(safe), borderRadius: safeRadius }}
            />
            {showChip && (
              <div
                className="pointer-events-none absolute box-border rounded-[3px] border border-ink/50 bg-paper/35"
                style={{
                  left: round2((geo.chipX ?? 0) * scale),
                  top: round2((geo.chipY ?? 0) * scale),
                  width: round2(CARD_CHIP_MM.w * scale),
                  height: round2(CARD_CHIP_MM.h * scale),
                }}
              />
            )}
            <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 -ml-[0.5px] w-px bg-ink/22" />
            <div className="pointer-events-none absolute left-0 right-0 top-1/2 -mt-[0.5px] h-px bg-ink/22" />
          </div>
          <div className="w-3.5 mono text-tag text-muted [writing-mode:vertical-rl]">
            {kind === "coin" ? "" : `${heightMm.toFixed(2)} mm`}
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-2.5 left-3 mono text-tag text-faint">
        {sideLabel} · {hint}
      </div>
    </section>
  );
}
