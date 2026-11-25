import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/data";
import { locales } from "@/lib/i18n/config";

const PAGES = ["", "/menu", "/club", "/journal", "/about", "/visit"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = (process.env.SITE_URL ?? "").replace(/\/+$/, "");
  const posts = await getPosts();
  const entry = (path: string, lastModified?: Date) => ({
    url: `${site}/${locales[0]}${path}`,
    lastModified,
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${site}/${l}${path}`])) },
  });
  return [...PAGES.map((p) => entry(p)), ...posts.map((p) => entry(`/journal/${p.slug}`, p.publishedAt ?? undefined))];
}
