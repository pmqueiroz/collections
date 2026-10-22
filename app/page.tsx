import { ArchiveIndex } from "../features/archive/archive-index";
import { loadCatalog } from "../features/archive/relic/load-catalog";

export default async function Page() {
  const catalog = await loadCatalog();
  return <ArchiveIndex catalog={catalog} />;
}
