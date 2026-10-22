import { Artifact } from "../../components/artifact/artifact";
import { ArtifactCaption } from "./artifact-caption";
import type { CatalogItem } from "./catalog";
import { artifactProps, type ConfigStore, configFor } from "./config-store";

type GridViewProps = {
  items: CatalogItem[];
  store: ConfigStore;
  onOpen: (id: string) => void;
};

export function GridView({ items, store, onOpen }: GridViewProps) {
  return (
    <main className="grid grid-cols-[repeat(auto-fill,minmax(232px,1fr))] gap-3 px-7 pb-12 pt-6">
      {items.map((item) => (
        <button
          type="button"
          key={item.id}
          onClick={() => onOpen(item.id)}
          className="flex cursor-pointer flex-col rounded-xs bg-surface text-left transition-colors duration-200 hover:bg-raised"
        >
          <div className="relative aspect-[1/0.84] w-full">
            <Artifact
              {...artifactProps(item, configFor(item, store))}
              mode="tilt"
            />
          </div>
          <ArtifactCaption item={item} truncate />
        </button>
      ))}
    </main>
  );
}
