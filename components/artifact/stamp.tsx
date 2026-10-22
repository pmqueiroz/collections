import type { CSSProperties } from "react";
import { clamp, perforationGrid, perforationMask, round2 } from "./geometry";
import type { MeshProps } from "./surface-props";
import {
  CLAY,
  CLAY_LINE,
  ClayGrid,
  ClayWell,
  FaceImage,
  MonoText,
  Sheen,
} from "./surfaces";

const STAMP_EXTENT = 168;

export function Stamp({
  geo,
  textured,
  obv,
  rev,
  fo,
  fr,
  face,
  origin,
  flat,
}: MeshProps) {
  const widthMm = geo.w || 20;
  const heightMm = geo.h || 24;
  const scale = STAMP_EXTENT / Math.max(widthMm, heightMm);
  const width = widthMm * scale;
  const height = heightMm * scale;
  const gauge = geo.perf || 14;
  const holeRatio = clamp(geo.hole ?? 0.55, 0.1, 0.95);
  const { stepX } = perforationGrid(width, height, gauge, holeRatio, scale);
  const mask = perforationMask(width, height, gauge, holeRatio, scale);
  const margin = round2(clamp((geo.margin ?? 1.6) * scale, 0, 40) + stepX / 2);
  const sheet: CSSProperties = {
    left: round2(120 - width / 2),
    top: round2(120 - height / 2),
    width: round2(width),
    height: round2(height),
    WebkitMask: mask,
    mask,
  };

  return (
    <div className="absolute inset-0 transform-3d">
      <div
        className="absolute overflow-hidden backface-hidden"
        style={{ ...sheet, transform: "translateZ(0.4px)" }}
      >
        {obv ? (
          <>
            <FaceImage src={obv} fit={fo} backing="#E9E8E3" />
            <Sheen strength={0.4} spread="60%" />
          </>
        ) : textured ? (
          <>
            <div
              className="absolute inset-0"
              style={{ background: "#E9E8E3" }}
            />
            <div
              className="absolute"
              style={{
                inset: margin,
                background: "linear-gradient(170deg, #D4D3CD 0%, #C2C1BB 100%)",
                boxShadow: "inset 0 0 0 1px rgba(22,22,21,0.12)",
              }}
            />
            <div
              className="absolute"
              style={{
                inset: margin,
                background:
                  "repeating-linear-gradient(135deg, rgba(22,22,21,0.04) 0 1px, rgba(22,22,21,0) 1px 4px)",
              }}
            />
            <div
              className="absolute box-border flex flex-col justify-between overflow-hidden px-[7px] py-1.5 font-mono text-muted"
              style={{ inset: margin }}
            >
              <div className="whitespace-nowrap text-[17px] font-medium tracking-[-0.03em]">
                {face}
              </div>
              <div className="text-center text-[6.5px] tracking-[0.14em]">
                OBV · SCAN
              </div>
              <div className="overflow-hidden whitespace-nowrap text-[6.5px] uppercase tracking-[0.14em]">
                {origin}
              </div>
            </div>
            <Sheen strength={0.5} spread="60%" />
          </>
        ) : (
          <>
            <ClayGrid cell={[22, 24]} />
            <div
              className="absolute"
              style={{
                inset: margin,
                border: `1px solid ${CLAY_LINE}`,
                background: CLAY,
              }}
            />
            <ClayWell className="left-1/2 top-1/2 -ml-[15px] -mt-[15px] size-[30px] rounded-xs" />
            <Sheen strength={0.35} spread="60%" />
          </>
        )}
      </div>
      {!flat && (
        <div
          className="absolute overflow-hidden backface-hidden"
          style={{ ...sheet, transform: "rotateY(180deg) translateZ(0.4px)" }}
        >
          {rev ? (
            <FaceImage src={rev} fit={fr} backing="#E3E2DC" />
          ) : textured ? (
            <>
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(160deg, #E6E5E0 0%, #DCDBD5 100%)",
                }}
              />
              <MonoText className="absolute bottom-4 left-0 right-0 text-center text-[6.5px] tracking-[0.14em]">
                REV · GUM
              </MonoText>
            </>
          ) : (
            <ClayGrid cell={[22, 24]} />
          )}
          <Sheen strength={0.6} spread="55%" />
        </div>
      )}
    </div>
  );
}
