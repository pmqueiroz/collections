import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArchiveIndex } from "../../../features/archive/archive-index";
import { itemSummary } from "../../../features/archive/catalog";
import {
  loadCatalog,
  loadCatalogItem,
} from "../../../features/archive/relic/load-catalog";

export async function generateStaticParams() {
  const catalog = await loadCatalog();
  return catalog.map((item) => ({ id: item.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/relics/[id]">): Promise<Metadata> {
  const item = await loadCatalogItem((await params).id);
  if (!item) return {};
  const title = `${item.title} · ${item.id}`;
  const description = itemSummary(item);
  return {
    title: `${title} · Master Index`,
    description,
    openGraph: { title, description, siteName: "Master Index" },
    twitter: { card: "summary_large_image", title, description },
  };
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
