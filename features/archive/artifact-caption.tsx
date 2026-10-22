import { cx } from "../../components/ui/cx";
import { type CatalogItem, itemSubtitle } from "./catalog";

export function ArtifactCaption({
  item,
  truncate = false,
  fluid = false,
}: {
  item: CatalogItem;
  truncate?: boolean;
  fluid?: boolean;
}) {
  return (
    <div
      className={cx(
        "flex flex-col gap-[3px] border-t border-line",
        fluid
          ? "px-2.5 pb-2.5 pt-2 regular:px-3.5 regular:pb-3.5 regular:pt-2.5"
          : "px-3.5 pb-3.5 pt-2.5",
      )}
    >
      <div className="mono text-meta text-muted">{item.id}</div>
      <div className={cx("text-card font-medium", truncate && "truncate")}>
        {item.title}
      </div>
      <div
        className={cx("mono text-control text-muted", truncate && "truncate")}
      >
        {itemSubtitle(item)}
      </div>
    </div>
  );
}
