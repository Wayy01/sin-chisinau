import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { PageTitle } from "@/components/admin/fields";
import { ItemForm } from "@/components/admin/ItemForm";

export default async function NewItem() {
  const { locale, t } = await getT();
  await requireAdmin(locale);
  const categories = await db.select().from(schema.categories).orderBy(asc(schema.categories.sort));
  return (
    <>
      <PageTitle kicker={t.admin.menu.title} title={t.admin.menu.add} />
      <ItemForm categories={categories} t={t} />
    </>
  );
}
