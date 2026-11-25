import Link from "next/link";
import { Plus, PencilSimple, Trash } from "@phosphor-icons/react/dist/ssr";
import { requireAdmin } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/config";
import { getMenu } from "@/lib/data";
import { deleteItem, toggleItem } from "@/lib/admin/actions";
import { PageTitle } from "@/components/admin/fields";
import { ActionButton, ToggleCell } from "@/components/admin/ActionButton";
import { ProductVisual } from "@/components/site/ProductVisual";

export default async function AdminMenu() {
  const { locale, t } = await getT();
  await requireAdmin(locale);
  const menu = await getMenu();
  const f = t.admin.fields;

  return (
    <>
      <PageTitle
        title={t.admin.menu.title}
        action={
          <Link href={`/${locale}/admin/menu/new`} className="btn">
            <Plus size={16} /> {t.admin.menu.add}
          </Link>
        }
      />
      <div className="space-y-8">
        {menu.map((cat) => (
          <section key={cat.id} className="overflow-hidden rounded-2xl border border-ink/10 bg-milk">
            <h2 className="border-b border-ink/10 px-5 py-4 font-display text-2xl italic">{pick(cat, "name", locale)}</h2>
            {cat.items.length === 0 ? (
              <p className="px-5 py-6 text-sm text-ink-soft">{t.admin.menu.empty}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm sm:min-w-[720px]">
                  <thead className="font-mono text-[10px] tracking-[0.15em] text-ink-soft uppercase">
                    <tr className="text-left">
                      <th className="hidden w-16 sm:table-cell" />
                      <th className="py-3 pr-3 pl-5 font-normal sm:pl-3">
                        {f.nameRo} / {f.nameRu}
                      </th>
                      <th className="hidden px-3 py-3 font-normal sm:table-cell">{f.price}</th>
                      <th className="px-3 py-3 font-normal">{f.available}</th>
                      <th className="hidden px-3 py-3 font-normal sm:table-cell">{t.common.signature}</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10">
                    {cat.items.map((item) => (
                      <tr key={item.id} className="hover:bg-paper/60">
                        <td className="hidden w-16 py-3 pl-5 sm:table-cell">
                          <span className="block size-12 overflow-hidden rounded-lg">
                            <ProductVisual image={item.image} alt="" categorySlug={cat.slug} />
                          </span>
                        </td>
                        <td className="py-3 pr-3 pl-5 sm:pl-3">
                          <p className="font-medium">{item.nameRo}</p>
                          <p className="text-ink-soft">{item.nameRu}</p>
                          <p className="mt-1 font-mono text-xs tabular sm:hidden">
                            {item.price} {t.common.lei}
                          </p>
                          {item.tags.length > 0 && <p className="mt-1 font-mono text-[10px] text-gilt uppercase">{item.tags.join(" · ")}</p>}
                        </td>
                        <td className="hidden px-3 py-3 font-mono whitespace-nowrap tabular sm:table-cell">
                          {item.price} {t.common.lei}
                        </td>
                        <td className="px-3 py-3">
                          <ToggleCell on={item.available} action={toggleItem.bind(null, item.id, "available")} />
                        </td>
                        <td className="hidden px-3 py-3 sm:table-cell">
                          <ToggleCell on={item.featured} action={toggleItem.bind(null, item.id, "featured")} />
                        </td>
                        <td className="py-3 pr-3 pl-1 sm:px-5">
                          <div className="flex justify-end gap-1">
                            <Link href={`/${locale}/admin/menu/${item.id}`} className="grid size-9 place-items-center rounded-full hover:bg-ink/5" aria-label={t.common.edit}>
                              <PencilSimple size={16} />
                            </Link>
                            <ActionButton action={deleteItem.bind(null, item.id)} confirm className="grid size-9 place-items-center rounded-full text-cherry hover:bg-cherry/10" title={t.common.delete}>
                              <Trash size={16} />
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
