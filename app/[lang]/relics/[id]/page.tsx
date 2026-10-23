import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArchiveIndex } from "../../../../features/archive/archive-index";
import { relicPagePath } from "../../../../features/archive/artifact-config";
import { itemSummary } from "../../../../features/archive/catalog";
import {
  loadCatalog,
  loadCatalogItem,
} from "../../../../features/archive/relic/load-catalog";
import { dictionaryFor } from "../../../../i18n/dictionary";
import { hasLocale, languageAlternates } from "../../../../i18n/locales";

export async function generateStaticParams() {
  const catalog = await loadCatalog();
  return catalog.map((item) => ({ id: item.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/relics/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  const item = await loadCatalogItem(id);
  if (!item || !hasLocale(lang)) return {};
  const dict = dictionaryFor(lang);
  const title = `${item.title} · ${item.id}`;
  const description = itemSummary(item, dict);
  return {
    title: `${title} · ${dict.site.name}`,
    description,
    alternates: {
      canonical: relicPagePath(lang, item.id),
      languages: languageAlternates(`/relics/${encodeURIComponent(item.id)}`),
    },
    openGraph: { title, description, siteName: dict.site.name, locale: lang },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Page({
  params,
}: PageProps<"/[lang]/relics/[id]">) {
  const { id } = await params;
  const [catalog, item] = await Promise.all([
    loadCatalog(),
    loadCatalogItem(id),
  ]);
  if (!item) notFound();
  return <ArchiveIndex catalog={catalog} relicId={item.id} />;
}
