import { PALETTE } from "./palette";

export type MarkTone = "ink" | "reversed";

const TONES: Record<MarkTone, { tray: string; disc: string }> = {
  ink: { tray: PALETTE.ink, disc: PALETTE.paper },
  reversed: { tray: PALETTE.paper, disc: PALETTE.ink },
};

export function markGeometry(size: number) {
  return {
    radius: Math.max(2, Math.round(size * 0.11)),
    disc: size / 2,
    inset: size / 4,
  };
}

export function Mark({
  size,
  tone = "ink",
}: {
  size: number;
  tone?: MarkTone;
}) {
  const { radius, disc, inset } = markGeometry(size);
  const colors = TONES[tone];
  return (
    <div
      aria-hidden
      style={{
        display: "flex",
        position: "relative",
        flex: "none",
        width: size,
        height: size,
        borderRadius: radius,
        background: colors.tray,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: inset,
          top: inset,
          width: disc,
          height: disc,
          borderRadius: "50%",
          background: colors.disc,
        }}
      />
    </div>
  );
}
