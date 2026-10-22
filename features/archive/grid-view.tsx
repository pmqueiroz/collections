import { Artifact } from "../../components/artifact/artifact";
import type { ArtifactMode } from "../../components/artifact/types";
import { ArtifactCaption } from "./artifact-caption";
import type { CatalogItem } from "./catalog";
import { artifactProps, type ConfigStore, configFor } from "./config-store";

type GridViewProps = {
  items: CatalogItem[];
  store: ConfigStore;
  mode: ArtifactMode;
  onOpen: (id: string) => void;
};

export function GridView({ items, store, mode, onOpen }: GridViewProps) {
  return (
    <main className="grid grid-cols-2 gap-2 p-3 pb-[calc(env(safe-area-inset-bottom)+72px)] regular:grid-cols-[repeat(auto-fill,minmax(232px,1fr))] regular:gap-3 regular:px-7 regular:pb-12 regular:pt-6">
      {items.map((item) => (
        <button
          type="button"
          key={item.id}
          onClick={() => onOpen(item.id)}
          className="flex min-w-0 cursor-pointer flex-col rounded-xs bg-surface text-left transition-colors duration-200 hover:bg-raised active:bg-raised"
        >
          <div className="relative aspect-[1/0.84] w-full">
            <Artifact
              {...artifactProps(item, configFor(item, store))}
              mode={mode}
            />
          </div>
          <ArtifactCaption item={item} truncate fluid />
        </button>
      ))}
    </main>
  );
}
