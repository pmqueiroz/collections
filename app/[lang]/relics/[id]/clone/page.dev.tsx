import { notFound } from "next/navigation";
import { loadCatalog } from "../../../../../features/archive/relic/load-catalog";
import { RelicEditor } from "../../../../../features/archive/relic-editor/relic-editor";
import {
  loadRelicDraft,
  nextIds,
} from "../../../../../features/archive/relic-editor/relic-store";

export const instant = false;

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { id } = await params;
  const catalog = await loadCatalog();
  if (!catalog.some((item) => item.id === id)) notFound();
  const suggestedIds = nextIds(catalog);
  const source = await loadRelicDraft(id);
  return (
    <RelicEditor
      initial={{
        ...source,
        meta: { ...source.meta, id: suggestedIds[source.kind] },
      }}
      previousId={null}
      cloneOf={id}
      suggestedIds={suggestedIds}
    />
  );
}
