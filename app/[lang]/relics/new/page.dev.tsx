import { loadCatalog } from "../../../../features/archive/relic/load-catalog";
import { blankEntry } from "../../../../features/archive/relic-editor/entry-draft";
import { RelicEditor } from "../../../../features/archive/relic-editor/relic-editor";
import { nextIds } from "../../../../features/archive/relic-editor/relic-store";

export default async function Page() {
  const suggestedIds = nextIds(await loadCatalog());
  return (
    <RelicEditor
      initial={blankEntry("coin", suggestedIds.coin)}
      previousId={null}
      suggestedIds={suggestedIds}
    />
  );
}
