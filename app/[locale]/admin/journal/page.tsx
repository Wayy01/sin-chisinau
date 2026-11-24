import Link from "next/link";
import { desc } from "drizzle-orm";
import { Plus, PencilSimple, Trash, Play } from "@phosphor-icons/react/dist/ssr";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { formatDate } from "@/lib/i18n/config";
import { deletePost } from "@/lib/admin/actions";
import { PageTitle } from "@/components/admin/fields";
import { ActionButton } from "@/components/admin/ActionButton";
import { cn } from "@/lib/cn";

export default async function AdminJournal() {
  const { locale, t } = await getT();
  await requireAdmin(locale);
  const posts = await db.select().from(schema.posts).orderBy(desc(schema.posts.createdAt));

  return (
    <>
      <PageTitle
        title={t.admin.journal.title}
        action={
          <Link href={`/${locale}/admin/journal/new`} className="btn">
            <Plus size={16} /> {t.admin.journal.add}
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {posts.map((p) => (
          <article key={p.id} className="group overflow-hidden rounded-2xl border border-ink/10 bg-milk">
            <Link href={`/${locale}/admin/journal/${p.id}`} className="relative block aspect-[16/10] overflow-hidden bg-paper-2">
              {p.cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.cover} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              )}
              <span className={cn("absolute top-3 left-3 rounded-full px-3 py-1 font-mono text-[10px] tracking-[0.15em] uppercase", p.published ? "bg-sage-deep text-paper" : "bg-paper text-ink")}>
                {p.published ? t.admin.journal.live : t.admin.journal.draft}
              </span>
              {p.video && (
                <span className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-paper/90">
                  <Play size={12} weight="fill" />
                </span>
              )}
            </Link>
            <div className="p-5">
              <p className="font-mono text-[10px] tracking-[0.15em] text-ink-soft uppercase">{formatDate(p.publishedAt ?? p.createdAt, locale)}</p>
              <h2 className="mt-2 font-display text-2xl leading-tight">{p.titleRo}</h2>
              <p className="text-sm text-ink-soft">{p.titleRu}</p>
              <div className="mt-4 flex gap-1">
                <Link href={`/${locale}/admin/journal/${p.id}`} className="btn btn-line btn-sm">
                  <PencilSimple size={14} /> {t.common.edit}
                </Link>
                <ActionButton action={deletePost.bind(null, p.id)} confirm title={t.common.delete} className="grid size-9 place-items-center rounded-full text-cherry hover:bg-cherry/10">
                  <Trash size={16} />
                </ActionButton>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
