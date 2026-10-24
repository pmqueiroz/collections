import { Mark, type MarkTone } from "./mark";

const UI_TRACKING = -0.045;
const DISPLAY_TRACKING = -0.06;
const DISPLAY_FROM = 56;

export function wordmarkTracking(size: number) {
  return size * (size >= DISPLAY_FROM ? DISPLAY_TRACKING : UI_TRACKING);
}

export function Lockup({
  name,
  size,
  tone,
}: {
  name: string;
  size: number;
  tone?: MarkTone;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: Math.round(size * 0.3 + 5),
      }}
    >
      <Mark size={size} tone={tone} />
      <div
        style={{
          fontSize: size,
          fontWeight: 600,
          letterSpacing: wordmarkTracking(size),
          lineHeight: 1,
        }}
      >
        {name}
      </div>
    </div>
  );
}
