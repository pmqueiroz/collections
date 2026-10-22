import type { CSSProperties } from "react";
import { clamp, round2 } from "./geometry";
import type { MeshProps } from "./surface-props";
import {
  CLAY_LINE,
  ClayGrid,
  ClayWell,
  FaceImage,
  MonoText,
  Sheen,
} from "./surfaces";

const CARD_WIDTH = 200;
const EDGE_LAYERS = [-0.5, -0.25, 0, 0.25, 0.5];

function MetalChip({ style }: { style: CSSProperties }) {
  return (
    <div
      className="absolute h-[22px] w-7 rounded-sm"
      style={{
        ...style,
        background:
          "linear-gradient(135deg, #DEDDD7 0%, #B6B5AF 50%, #D6D5CF 100%)",
        boxShadow:
          "inset 0 0 0 0.6px rgba(22,22,21,0.32), inset 0.6px 0.8px 1.2px rgba(22,22,21,0.25)",
      }}
    >
      <div
        className="absolute inset-[3px]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(0,0,0,0) calc(50% - 0.3px), rgba(22,22,21,0.3) calc(50% - 0.3px) calc(50% + 0.3px), rgba(0,0,0,0) calc(50% + 0.3px)), linear-gradient(0deg, rgba(0,0,0,0) 32%, rgba(22,22,21,0.3) 32% 35%, rgba(0,0,0,0) 35% 65%, rgba(22,22,21,0.3) 65% 68%, rgba(0,0,0,0) 68%)",
        }}
      />
      <div
        className="absolute left-[9px] top-[7px] box-border h-2 w-2.5 rounded-[1.5px]"
        style={{
          border: "0.6px solid rgba(22,22,21,0.3)",
          background: "linear-gradient(135deg, #D4D3CD, #BDBCB6)",
        }}
      />
    </div>
  );
}

function ClayChip({ style }: { style: CSSProperties }) {
  return (
    <div
      className="absolute box-border h-[22px] w-7 rounded-sm"
      style={{
        ...style,
        background: "#DCDBD6",
        border: `1px solid ${CLAY_LINE}`,
        boxShadow: "inset 0.6px 0.8px 1.2px rgba(22,22,21,0.14)",
      }}
    >
      <div
        className="absolute bottom-0.5 left-1/2 top-0.5 -ml-[0.5px] w-px"
        style={{ background: CLAY_LINE }}
      />
      <div
        className="absolute left-0.5 right-0.5 top-1.5 h-px"
        style={{ background: CLAY_LINE }}
      />
      <div
        className="absolute left-0.5 right-0.5 top-[13px] h-px"
        style={{ background: CLAY_LINE }}
      />
    </div>
  );
}

export function Card({
  geo,
  textured,
  obv,
  rev,
  fo,
  fr,
  face,
  code,
  flat,
}: MeshProps) {
  const scale = CARD_WIDTH / (geo.w || 85.6);
  const height = round2(clamp((geo.h || 53.98) * scale, 40, 220));
  const thickness = clamp((geo.thk ?? 0.76) * scale, 0.6, 12);
  const radius = round2(clamp((geo.r ?? 3.18) * scale, 0, height / 2));
  const half = round2(thickness / 2);
  const lit = textured || Boolean(obv);
  const chip = geo.chip !== false;
  const chipStyle = {
    left: round2((geo.chipX ?? 9.4) * scale),
    top: round2((geo.chipY ?? 19.7) * scale),
  };
  const slab: CSSProperties = {
    left: 20,
    top: round2(120 - height / 2),
    width: CARD_WIDTH,
    height,
    borderRadius: radius,
  };
  const clayOutline = (
    <div
      className="absolute inset-0"
      style={{
        borderRadius: radius,
        boxShadow: `inset 0 0 0 1px ${CLAY_LINE}`,
      }}
    />
  );

  return (
    <div className="absolute inset-0 transform-3d">
      {!flat &&
        EDGE_LAYERS.map((position, index) => (
          <div
            key={position}
            className="absolute"
            style={{
              ...slab,
              background: index % 2 ? "#D3D2CC" : "#CFCEC8",
              transform: `translateZ(${round2(position * thickness * 0.9)}px)`,
            }}
          />
        ))}
      <div
        className="absolute overflow-hidden backface-hidden"
        style={{ ...slab, transform: `translateZ(${half}px)` }}
      >
        {obv ? (
          <FaceImage src={obv} fit={fo} backing="#D3D2CC" />
        ) : textured ? (
          <>
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(155deg, #DAD9D3 0%, #C6C5BF 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "repeating-linear-gradient(45deg, rgba(22,22,21,0.035) 0 1.5px, rgba(22,22,21,0) 1.5px 6px)",
              }}
            />
            <MonoText className="absolute left-3.5 top-3 text-[7px] tracking-[0.14em]">
              OBV · SCAN
            </MonoText>
            <MonoText className="absolute right-3.5 top-3 text-[7px] tracking-[0.08em]">
              {code}
            </MonoText>
            <MonoText className="absolute bottom-2 right-3.5 text-[32px] font-medium tracking-[-0.04em]">
              {face}
            </MonoText>
          </>
        ) : (
          <>
            <ClayGrid cell={[20, 21]} />
            {clayOutline}
            <ClayWell className="left-32 top-1/2 -mt-3.5 size-7 rounded-full" />
          </>
        )}
        {chip && lit && <MetalChip style={chipStyle} />}
        {chip && !lit && <ClayChip style={chipStyle} />}
        <Sheen strength={0.5} />
      </div>
      {!flat && (
        <div
          className="absolute overflow-hidden backface-hidden"
          style={{
            ...slab,
            transform: `rotateY(180deg) translateZ(${half}px)`,
          }}
        >
          {rev ? (
            <FaceImage src={rev} fit={fr} backing="#D3D2CC" />
          ) : textured ? (
            <>
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(200deg, #E2E1DB 0%, #D4D3CD 100%)",
                }}
              />
              <div className="absolute left-3.5 right-3.5 top-3.5 flex flex-col gap-[5px]">
                <div className="h-px bg-ink/14" />
                <div className="h-px w-[70%] bg-ink/14" />
                <div className="h-px w-[45%] bg-ink/14" />
              </div>
              <MonoText className="absolute bottom-3 left-3.5 text-[7px] tracking-[0.14em]">
                REV · SCAN · {code}
              </MonoText>
            </>
          ) : (
            <>
              <ClayGrid cell={[20, 21]} />
              {clayOutline}
            </>
          )}
          <Sheen strength={0.5} />
        </div>
      )}
    </div>
  );
}
