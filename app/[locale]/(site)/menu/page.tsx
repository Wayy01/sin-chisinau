import type { Metadata } from "next";
import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { getMenu } from "@/lib/data";
import { getT } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/config";
import { PageHeader } from "@/components/site/PageHeader";
import { MenuBrowser } from "@/components/menu/MenuBrowser";
import { FavoritesHydrator } from "@/components/menu/FavoriteButton";
import { InkCup } from "@/components/art/Ink";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t.menu.title, description: t.menu.lead };
}

async function Favorites() {
  const user = await getCurrentUser();
  const rows = user
    ? await db.select({ id: schema.favorites.itemId }).from(schema.favorites).where(eq(schema.favorites.userId, user.id))
    : [];
  return <FavoritesHydrator ids={rows.map((r) => r.id)} loggedIn={!!user} />;
}

export default async function MenuPage() {
  const [{ locale, t }, menu] = await Promise.all([getT(), getMenu()]);

  const categories = menu.map((c) => ({
    slug: c.slug,
    name: pick(c, "name", locale),
    blurb: pick(c, "blurb", locale),
    image: c.image,
    items: c.items.map((i) => ({
      id: i.id,
      slug: i.slug,
      name: pick(i, "name", locale),
      desc: pick(i, "desc", locale),
      price: i.price,
      portion: i.portion,
      image: i.image,
      tags: i.tags,
      available: i.available,
      categorySlug: c.slug,
    })),
  }));

  return (
    <>
      <PageHeader
        kicker={t.menu.kicker}
        title={t.menu.title}
        lead={t.menu.lead}
        aside={<InkCup className="mt-8 hidden w-28 text-gilt lg:block" weight={1.3} />}
      />
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <MenuBrowser categories={categories} />
      </div>
      <Suspense>
        <Favorites />
      </Suspense>
    </>
  );
}
