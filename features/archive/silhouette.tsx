import type { ArtifactKind } from "../../components/artifact/types";

const STAMP_MASK =
  "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 1px, #000 1.3px) -2px -2px / 4px 4px repeat, linear-gradient(#000, #000) center / 12px 16px no-repeat";

export function Silhouette({ kind }: { kind: ArtifactKind }) {
  return (
    <div className="flex size-6 items-center justify-center">
      {kind === "coin" && (
        <div className="box-border size-[18px] rounded-full border border-muted bg-muted" />
      )}
      {kind === "note" && (
        <div className="box-border h-3 w-6 rounded-[1px] border border-muted bg-muted" />
      )}
      {kind === "card" && (
        <div className="relative box-border h-3.5 w-[22px] rounded-xs border border-muted bg-muted">
          <div className="absolute left-[2.5px] top-[3.5px] h-1 w-[5px] rounded-[1px] bg-surface" />
        </div>
      )}
      {kind === "stamp" && (
        <div
          className="box-border h-5 w-4 border border-muted bg-muted"
          style={{ WebkitMask: STAMP_MASK, mask: STAMP_MASK }}
        />
      )}
    </div>
  );
}
