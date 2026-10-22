import { cx } from "../../components/ui/cx";
import type { Domain } from "./catalog";

const STROKE = "box-border border-[1.4px] border-current";

export function DomainGlyph({
  domain,
  active,
}: {
  domain: Domain;
  active: boolean;
}) {
  const fill = active ? "bg-current" : "bg-transparent";
  return (
    <div className="flex h-[22px] w-[26px] items-center justify-center">
      {domain === "all" && (
        <div className="grid grid-cols-[7px_7px] gap-[3px]">
          {[0, 1, 2, 3].map((cell) => (
            <div key={cell} className={cx("size-[7px]", STROKE, fill)} />
          ))}
        </div>
      )}
      {domain === "coin" && (
        <div className={cx("size-[19px] rounded-full", STROKE, fill)} />
      )}
      {domain === "note" && (
        <div className={cx("h-[13px] w-[25px] rounded-[1px]", STROKE, fill)} />
      )}
      {domain === "card" && (
        <div
          className={cx("relative h-[15px] w-[23px] rounded-xs", STROKE, fill)}
        >
          <div
            className={cx(
              "absolute left-0.5 top-[3px] h-1 w-[5px] rounded-[1px]",
              active ? "bg-paper" : "bg-transparent",
            )}
          />
        </div>
      )}
      {domain === "stamp" && (
        <div
          className={cx(
            "box-border h-5 w-4 border-[1.4px] border-dotted border-current",
            fill,
          )}
        />
      )}
    </div>
  );
}
