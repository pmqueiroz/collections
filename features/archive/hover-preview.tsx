import { Artifact } from "../../components/artifact/artifact";
import { ArtifactCaption } from "./artifact-caption";
import { artifactProps } from "./artifact-config";
import type { CatalogItem } from "./catalog";

export type PreviewPosition = { id: string; x: number; y: number };

export function HoverPreview({
  item,
  x,
  y,
}: {
  item: CatalogItem;
  x: number;
  y: number;
}) {
  return (
    <div
      className="pointer-events-none fixed z-30 w-[280px] overflow-hidden rounded-xs border border-line bg-surface shadow-float"
      style={{ left: x, top: y }}
    >
      <div className="relative h-[196px]">
        <Artifact {...artifactProps(item)} mode="static" />
      </div>
      <ArtifactCaption item={item} />
    </div>
  );
}
