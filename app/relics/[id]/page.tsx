import { notFound } from "next/navigation";
import { ArchiveIndex } from "../../../features/archive/archive-index";
import {
  loadCatalog,
  loadCatalogItem,
} from "../../../features/archive/relic/load-catalog";

export async function generateStaticParams() {
  const catalog = await loadCatalog();
  return catalog.map((item) => ({ id: item.id }));
}

export default async function Page({ params }: PageProps<"/relics/[id]">) {
  const { id } = await params;
  const [catalog, item] = await Promise.all([
    loadCatalog(),
    loadCatalogItem(id),
  ]);
  if (!item) notFound();
  return <ArchiveIndex catalog={catalog} relicId={item.id} />;
}
