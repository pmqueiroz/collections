import { clamp, round2 } from "./geometry";
import type { MeshProps } from "./surface-props";
import { FaceImage, MonoText, Sheen, scanLabel } from "./surfaces";

const RIM = Array.from({ length: 40 }, (_, index) => {
  const angle = index * 9;
  const radians = (angle * Math.PI) / 180;
  const light = Math.sin(radians) * -0.55 + -Math.cos(radians) * -0.83;
  return { angle, shade: 0.03 + (0.2 * (1 - light)) / 2 };
});

const FACE_SIZE = 180;
const SCALE_BASE = 180;

function ImageBevel({ bevel }: { bevel: number }) {
  return (
    <div
      className="absolute inset-0 rounded-full"
      style={{
        boxShadow: `inset 0 0 0 ${bevel}px rgba(210,209,203,0.28), inset 0 0 0 ${bevel + 1}px rgba(22,22,21,0.12), inset 0 0 8px 2px rgba(22,22,21,0.12)`,
      }}
    />
  );
}

function ScanBevel({ bevel, rim }: { bevel: number; rim: string }) {
  return (
    <div
      className="absolute inset-0 rounded-full"
      style={{
        boxShadow: `inset 0 0 0 ${bevel}px ${rim}, inset 0 0 0 ${bevel + 1}px rgba(22,22,21,0.14), inset 0 0 6px ${bevel + 1}px rgba(22,22,21,0.06)`,
      }}
    />
  );
}

const ENGRAVING =
  "repeating-radial-gradient(circle at 50% 50%, rgba(22,22,21,0.045) 0 0.6px, rgba(22,22,21,0) 0.6px 2.4px)";

function ObverseScan({
  bevel,
  face,
  code,
  loading = false,
}: {
  bevel: number;
  face: string;
  code: string;
  loading?: boolean;
}) {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 38% 32%, #DEDDD7 0%, #CBCAC4 55%, #BAB9B3 100%)",
        }}
      />
      <div className="absolute inset-0" style={{ background: ENGRAVING }} />
      <ScanBevel bevel={bevel} rim="#D2D1CB" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
        <MonoText className="text-[8px] tracking-[0.14em]">
          OBV · {scanLabel(loading)}
        </MonoText>
        <MonoText
          className="text-[34px] font-medium tracking-[-0.03em]"
          style={{ textShadow: "0 1px 0 rgba(245,244,240,0.6)" }}
        >
          {face}
        </MonoText>
        <MonoText className="text-[8px] tracking-[0.08em]">{code}</MonoText>
      </div>
      <Sheen strength={0.6} />
    </>
  );
}

function ReverseScan({
  bevel,
  year,
  loading = false,
}: {
  bevel: number;
  year: string;
  loading?: boolean;
}) {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 62% 32%, #DBDAD4 0%, #C8C7C1 55%, #B8B7B1 100%)",
        }}
      />
      <div className="absolute inset-0" style={{ background: ENGRAVING }} />
      <ScanBevel bevel={bevel} rim="#D0CFC9" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
        <MonoText className="text-[8px] tracking-[0.14em]">
          REV · {scanLabel(loading)}
        </MonoText>
        <MonoText
          className="text-[30px] font-medium tracking-[-0.02em]"
          style={{ textShadow: "0 1px 0 rgba(245,244,240,0.6)" }}
        >
          {year}
        </MonoText>
      </div>
      <Sheen strength={0.55} />
    </>
  );
}

export function Coin({
  geo,
  obv,
  rev,
  fo,
  fr,
  face,
  code,
  year,
  flat,
}: MeshProps) {
  const scale = SCALE_BASE / (geo.dia || 24);
  const thickness = round2(clamp((geo.thk || 1.8) * scale, 2, 40));
  const bevel = round2(clamp((geo.bevel ?? 1) * scale, 0, 40));
  const reeded = (geo.edge || "reeded") === "reeded";
  const rimBackground = reeded
    ? "repeating-linear-gradient(90deg, #BDBCB6 0 0.8px, #D4D3CD 0.8px 2.6px)"
    : "linear-gradient(#CFCEC8, #C6C5BF)";
  const half = round2(thickness / 2);
  const faceBox = {
    left: 30,
    top: 30,
    width: FACE_SIZE,
    height: FACE_SIZE,
  };

  return (
    <div className="absolute inset-0 transform-3d">
      {!flat &&
        RIM.map((segment) => (
          <div
            key={segment.angle}
            className="absolute box-border"
            style={{
              left: 112.7,
              top: round2(120 - thickness / 2),
              width: 14.6,
              height: thickness,
              transform: `rotateZ(${segment.angle}deg) translateY(-90px) rotateX(90deg)`,
              background: rimBackground,
            }}
          >
            <div
              className="absolute inset-0 bg-ink"
              style={{ opacity: segment.shade }}
            />
          </div>
        ))}
      <div
        className="absolute overflow-hidden rounded-full backface-hidden"
        style={{ ...faceBox, transform: `translateZ(${half}px)` }}
      >
        {obv ? (
          <>
            <FaceImage
              src={obv}
              fit={fo}
              backing="#CBCAC4"
              placeholder={(loading) => (
                <ObverseScan
                  bevel={bevel}
                  face={face}
                  code={code}
                  loading={loading}
                />
              )}
            />
            <ImageBevel bevel={bevel} />
            <Sheen strength={0.45} />
          </>
        ) : (
          <ObverseScan bevel={bevel} face={face} code={code} />
        )}
      </div>
      {!flat && (
        <div
          className="absolute overflow-hidden rounded-full backface-hidden"
          style={{
            ...faceBox,
            transform: `rotateY(180deg) translateZ(${half}px)`,
          }}
        >
          {rev ? (
            <>
              <FaceImage
                src={rev}
                fit={fr}
                backing="#CBCAC4"
                placeholder={(loading) => (
                  <ReverseScan bevel={bevel} year={year} loading={loading} />
                )}
              />
              <ImageBevel bevel={bevel} />
              <Sheen strength={0.45} />
            </>
          ) : (
            <ReverseScan bevel={bevel} year={year} />
          )}
        </div>
      )}
    </div>
  );
}
