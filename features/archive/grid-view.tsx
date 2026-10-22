import { memo, useCallback, useRef } from "react";
import { Artifact } from "../../components/artifact/artifact";
import type { ArtifactMode } from "../../components/artifact/types";
import { useInView } from "../../components/ui/use-in-view";
import { ArtifactCaption } from "./artifact-caption";
import { artifactProps } from "./artifact-config";
import type { CatalogItem } from "./catalog";

type GridViewProps = {
  items: CatalogItem[];
  mode: ArtifactMode;
  onOpen: (id: string) => void;
};

const MOUNT_MARGIN = "600px 0px";

export function GridView({ items, mode, onOpen }: GridViewProps) {
  const openRef = useRef(onOpen);
  openRef.current = onOpen;
  const open = useCallback((id: string) => openRef.current(id), []);

  return (
    <main className="grid grid-cols-2 gap-2 p-3 pb-[calc(env(safe-area-inset-bottom)+72px)] regular:grid-cols-[repeat(auto-fill,minmax(232px,1fr))] regular:gap-3 regular:px-7 regular:pb-12 regular:pt-6">
      {items.map((item) => (
        <GridCard key={item.id} item={item} mode={mode} onOpen={open} />
      ))}
    </main>
  );
}

const GridCard = memo(function GridCard({
  item,
  mode,
  onOpen,
}: {
  item: CatalogItem;
  mode: ArtifactMode;
  onOpen: (id: string) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, MOUNT_MARGIN);

  return (
    <button
      type="button"
      onClick={() => onOpen(item.id)}
      className="flex min-w-0 cursor-pointer flex-col rounded-xs bg-surface text-left transition-colors duration-200 hover:bg-raised active:bg-raised"
    >
      <div ref={stageRef} className="relative aspect-[1/0.84] w-full">
        {inView && <Artifact {...artifactProps(item)} mode={mode} />}
      </div>
      <ArtifactCaption item={item} truncate fluid />
    </button>
  );
});
