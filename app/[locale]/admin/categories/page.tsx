import { asc, sql } from "drizzle-orm";
import { Plus, Trash } from "@phosphor-icons/react/dist/ssr";
import { db, schema } from "@/db";
import type { Category } from "@/db/schema";
import type { Dictionary } from "@/lib/i18n/dictionaries/ro";
import { requireAdmin } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { deleteCategory, saveCategory } from "@/lib/admin/actions";
import { AdminForm, SubmitButton } from "@/components/admin/AdminForm";
import { ActionButton } from "@/components/admin/ActionButton";
import { Area, Field, PageTitle } from "@/components/admin/fields";
import { MediaPicker } from "@/components/admin/MediaPicker";

function CategoryForm({ c, t, count }: { c?: Category; t: Dictionary; count?: number }) {
  const f = t.admin.fields;
  return (
    <AdminForm action={saveCategory} resetOnSuccess={!c} className="grid gap-5 md:grid-cols-[220px_1fr]">
      {c && <input type="hidden" name="id" value={c.id} />}
      <MediaPicker name="image" label={f.image} defaultValue={c?.image} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={f.nameRo} name="nameRo" defaultValue={c?.nameRo} required />
        <Field label={f.nameRu} name="nameRu" defaultValue={c?.nameRu} required />
        <Area label={f.blurbRo} name="blurbRo" defaultValue={c?.blurbRo ?? ""} rows={2} />
        <Area label={f.blurbRu} name="blurbRu" defaultValue={c?.blurbRu ?? ""} rows={2} />
        <Field label={f.slug} name="slug" defaultValue={c?.slug} placeholder="auto" />
        <Field label={f.sort} name="sort" type="number" defaultValue={c?.sort ?? 0} />
        <div className="flex items-center gap-3 md:col-span-2">
          <SubmitButton label={c ? t.common.save : t.common.create} />
          {c && <span className="font-mono text-[11px] text-ink-soft">{count} items</span>}
        </div>
      </div>
    </AdminForm>
  );
}

export default async function AdminCategories() {
  const { locale, t } = await getT();
  await requireAdmin(locale);
  const [cats, counts] = await Promise.all([
    db.select().from(schema.categories).orderBy(asc(schema.categories.sort)),
    db.select({ id: schema.menuItems.categoryId, n: sql<number>`count(*)::int` }).from(schema.menuItems).groupBy(schema.menuItems.categoryId),
  ]);
  const countOf = new Map(counts.map((c) => [c.id, c.n]));

  return (
    <>
      <PageTitle title={t.admin.categories.title} />
      <details className="group mb-8 rounded-2xl border border-dashed border-ink/20 p-5">
        <summary className="flex cursor-pointer list-none items-center gap-2 font-display text-2xl">
          <Plus size={18} className="transition-transform group-open:rotate-45" /> {t.admin.categories.add}
        </summary>
        <div className="mt-6">
          <CategoryForm t={t} />
        </div>
      </details>
      <div className="space-y-5">
        {cats.map((c) => (
          <div key={c.id} className="relative rounded-2xl border border-ink/10 bg-milk p-5">
            <ActionButton
              action={deleteCategory.bind(null, c.id)}
              confirm
              title={t.common.delete}
              className="absolute top-4 right-4 grid size-9 place-items-center rounded-full text-cherry hover:bg-cherry/10"
            >
              <Trash size={16} />
            </ActionButton>
            <CategoryForm c={c} t={t} count={countOf.get(c.id) ?? 0} />
          </div>
        ))}
      </div>
    </>
  );
}
