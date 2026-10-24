import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { dictionaryFor } from "../../i18n/dictionary";
import { LocaleProvider } from "../../i18n/locale-provider";
import {
  hasLocale,
  LOCALES,
  languageAlternates,
  localePath,
} from "../../i18n/locales";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = dictionaryFor(lang);
  return {
    metadataBase: new URL("https://relics.pmqueiroz.dev"),
    title: dict.site.name,
    description: dict.site.description,
    appleWebApp: { capable: true, title: dict.site.name },
    alternates: {
      canonical: localePath(lang),
      languages: languageAlternates(),
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F5F4F0",
};

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <html lang={lang} className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-paper text-ink" suppressHydrationWarning>
        <LocaleProvider locale={lang}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
