import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { PageTitle } from "@/components/admin/fields";
import { ItemForm } from "@/components/admin/ItemForm";

export default async function EditItem({ params }: PageProps<"/[locale]/admin/menu/[id]">) {
  const [{ id }, { locale, t }] = await Promise.all([params, getT()]);
  await requireAdmin(locale);
  if (!z.uuid().safeParse(id).success) notFound();
  const [[item], categories] = await Promise.all([
    db.select().from(schema.menuItems).where(eq(schema.menuItems.id, id)),
    db.select().from(schema.categories).orderBy(asc(schema.categories.sort)),
  ]);
  if (!item) notFound();
  return (
    <>
      <PageTitle kicker={t.admin.menu.title} title={item.nameRo} />
      <ItemForm item={item} categories={categories} t={t} />
    </>
  );
}
