import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { and, asc, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";

export const TAGS = {
  menu: "menu",
  posts: "posts",
  settings: "settings",
  rewards: "rewards",
} as const;

export type SiteSettings = {
  address: string;
  phone: string;
  hours: string;
  instagram: string;
  mapsUrl: string;
  announcementRo: string;
  announcementRu: string;
  heroLeadRo: string;
  heroLeadRu: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  address: "str. 31 August 1989, 113, Chișinău",
  phone: "+373 683 33 213",
  hours: "08:00–21:00",
  instagram: "https://www.instagram.com/sin.chisinau/",
  mapsUrl: "https://maps.google.com/?q=SIN+str.+31+August+1989+113+Chisinau",
  announcementRo: "Black Forest cinnamon roll e acum în vitrină",
  announcementRu: "Black Forest синнабон уже на витрине",
  heroLeadRo: "",
  heroLeadRu: "",
};

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.settings);
  const [row] = await db.select().from(schema.settings).where(eq(schema.settings.key, "site"));
  return { ...DEFAULT_SETTINGS, ...((row?.value as Partial<SiteSettings>) ?? {}) };
}

export async function getMenu() {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.menu);
  const [cats, items] = await Promise.all([
    db.select().from(schema.categories).orderBy(asc(schema.categories.sort)),
    db.select().from(schema.menuItems).orderBy(asc(schema.menuItems.sort), asc(schema.menuItems.nameRo)),
  ]);
  return cats.map((c) => ({ ...c, items: items.filter((i) => i.categoryId === c.id) }));
}

export async function getFeaturedItems() {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.menu);
  return db
    .select()
    .from(schema.menuItems)
    .where(and(eq(schema.menuItems.featured, true), eq(schema.menuItems.available, true)))
    .orderBy(asc(schema.menuItems.sort))
    .limit(10);
}

export async function getSeasonalDrinks() {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.menu);
  const items = await db.select().from(schema.menuItems).orderBy(asc(schema.menuItems.sort));
  return items.filter((i) => i.tags.includes("seasonal") && i.available).slice(0, 6);
}

export async function getPosts(limit?: number) {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.posts);
  const query = db
    .select()
    .from(schema.posts)
    .where(eq(schema.posts.published, true))
    .orderBy(desc(schema.posts.publishedAt));
  return limit ? query.limit(limit) : query;
}

export async function getPost(slug: string) {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.posts);
  const [post] = await db
    .select()
    .from(schema.posts)
    .where(and(eq(schema.posts.slug, slug), eq(schema.posts.published, true)));
  return post ?? null;
}

export async function getRewards() {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.rewards);
  return db
    .select()
    .from(schema.rewards)
    .where(eq(schema.rewards.active, true))
    .orderBy(asc(schema.rewards.cost));
}

export function readingMinutes(text: string) {
  return Math.max(1, Math.round(text.split(/\s+/).length / 180));
}
