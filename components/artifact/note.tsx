import type { ReactNode } from "react";
import { clamp, round2 } from "./geometry";
import type { MeshProps, SurfaceProps } from "./surface-props";
import { FaceImage, MonoText, Sheen, scanLabel } from "./surfaces";

const STRIP_COUNT = 11;
const STRIP_PITCH = 20;
const NOTE_WIDTH = 220;

function strips(curve: number) {
  return Array.from({ length: STRIP_COUNT }, (_, index) => {
    const x = -100 + STRIP_PITCH * index;
    return {
      x,
      z: round2(curve * (x / 110) ** 2),
      angle: round2((-Math.atan((2 * curve * x) / 12100) * 180) / Math.PI),
      front: STRIP_PITCH * index,
      back: 200 - STRIP_PITCH * index,
      shade: 0.015 + (0.05 * Math.max(0, x)) / 100,
    };
  });
}

function FrontFace({
  obv,
  fo,
  face,
  code,
}: Pick<SurfaceProps, "obv" | "fo" | "face" | "code">) {
  if (obv)
    return (
      <>
        <FaceImage
          src={obv}
          fit={fo}
          backing="#D3D2CC"
          placeholder={(loading) => (
            <FrontScan face={face} code={code} loading={loading} />
          )}
        />
        <Sheen strength={0.4} spread="60%" />
      </>
    );
  return <FrontScan face={face} code={code} />;
}

function FrontScan({
  face,
  code,
  loading = false,
}: Pick<SurfaceProps, "face" | "code"> & { loading?: boolean }) {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, #DAD9D3 0%, #CDCCC6 55%, #D7D6D0 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(22,22,21,0.04) 0 0.5px, rgba(22,22,21,0) 0.5px 2.2px)",
        }}
      />
      <div className="absolute inset-[7px] border border-ink/13" />
      <div
        className="absolute left-[148px] top-[21%] h-[58%] w-[52px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, #E4E3DD 0%, #DBDAD4 65%, rgba(219,218,212,0) 100%)",
        }}
      />
      <MonoText className="absolute left-4 top-[13px] text-[22px] font-medium tracking-[-0.03em]">
        {face}
      </MonoText>
      <MonoText className="absolute bottom-[13px] left-4 text-[7px] tracking-[0.14em]">
        OBV · {scanLabel(loading)} · {code}
      </MonoText>
      <Sheen strength={0.5} spread="60%" />
    </>
  );
}

function BackFace({
  rev,
  fr,
  face,
  year,
}: Pick<SurfaceProps, "rev" | "fr" | "face" | "year">) {
  if (rev)
    return (
      <>
        <FaceImage
          src={rev}
          fit={fr}
          backing="#D3D2CC"
          placeholder={(loading) => (
            <BackScan face={face} year={year} loading={loading} />
          )}
        />
        <Sheen strength={0.4} spread="60%" />
      </>
    );
  return <BackScan face={face} year={year} />;
}

function BackScan({
  face,
  year,
  loading = false,
}: Pick<SurfaceProps, "face" | "year"> & { loading?: boolean }) {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(80deg, #D6D5CF 0%, #CAC9C3 50%, #D4D3CD 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(90deg, rgba(22,22,21,0.035) 0 0.5px, rgba(22,22,21,0) 0.5px 2.2px)",
        }}
      />
      <div className="absolute inset-[7px] border border-ink/13" />
      <MonoText className="absolute right-4 top-[13px] text-[22px] font-medium tracking-[-0.03em]">
        {face}
      </MonoText>
      <MonoText className="absolute bottom-[13px] left-4 text-[7px] tracking-[0.14em]">
        REV · {scanLabel(loading)} · {year}
      </MonoText>
      <Sheen strength={0.45} spread="60%" />
    </>
  );
}

function StripWindow({
  offset,
  height,
  shade,
  flipped,
  children,
}: {
  offset: number;
  height: number;
  shade: number;
  flipped: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className="absolute inset-0 overflow-hidden backface-hidden"
      style={{
        transform: flipped
          ? "rotateY(180deg) translateZ(0.1px)"
          : "translateZ(0.1px)",
      }}
    >
      <div
        className="absolute top-0 overflow-hidden"
        style={{ left: -offset, width: NOTE_WIDTH, height }}
      >
        {children}
      </div>
      <div className="absolute inset-0 bg-ink" style={{ opacity: shade }} />
    </div>
  );
}

export function Note({ flat, ...props }: MeshProps) {
  const { geo } = props;
  const scale = NOTE_WIDTH / (geo.w || 150);
  const height = round2(clamp((geo.h || 76) * scale, 40, 220));
  const curve = (geo.curve ?? 1.5) * scale;
  const top = round2(120 - height / 2);

  if (flat)
    return (
      <div
        className="absolute"
        style={{ left: 10, top, width: NOTE_WIDTH, height }}
      >
        <StripWindow offset={0} height={height} shade={0} flipped={false}>
          <FrontFace {...props} />
        </StripWindow>
      </div>
    );

  return (
    <div className="absolute inset-0 transform-3d">
      {strips(curve).map((strip) => (
        <div
          key={strip.x}
          className="absolute transform-3d"
          style={{
            left: 110,
            top,
            width: 20.4,
            height,
            transform: `translateX(${strip.x}px) translateZ(${strip.z}px) rotateY(${strip.angle}deg)`,
          }}
        >
          <StripWindow
            offset={strip.front}
            height={height}
            shade={strip.shade}
            flipped={false}
          >
            <FrontFace {...props} />
          </StripWindow>
          <StripWindow
            offset={strip.back}
            height={height}
            shade={strip.shade}
            flipped
          >
            <BackFace {...props} />
          </StripWindow>
        </div>
      ))}
    </div>
  );
}
