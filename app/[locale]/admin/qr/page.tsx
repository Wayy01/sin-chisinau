import Link from "next/link";
import { desc, sql } from "drizzle-orm";
import { Plus, Printer, Trash } from "@phosphor-icons/react/dist/ssr";
import { db, schema } from "@/db";
import type { QrDrop } from "@/db/schema";
import type { Dictionary } from "@/lib/i18n/dictionaries/ro";
import { requireAdmin } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { deleteQr, saveQr } from "@/lib/admin/actions";
import { publicOrigin } from "@/lib/admin/origin";
import { qrSvg } from "@/lib/qr";
import { AdminForm, SubmitButton } from "@/components/admin/AdminForm";
import { ActionButton } from "@/components/admin/ActionButton";
import { Check, Field, PageTitle } from "@/components/admin/fields";

const local = (d: Date | null) => (d ? new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 16) : "");

function QrForm({ q, t }: { q?: QrDrop; t: Dictionary }) {
  const f = t.admin.fields;
  return (
    <AdminForm action={saveQr} resetOnSuccess={!q} className="grid gap-4 md:grid-cols-2">
      {q && <input type="hidden" name="id" value={q.id} />}
      <Field label={f.code} name="code" defaultValue={q?.code} required placeholder="MASA-SIN" className="font-mono" />
      <Field label={f.halos} name="halos" type="number" min={1} defaultValue={q?.halos ?? 25} required />
      <Field label={f.titleRo} name="titleRo" defaultValue={q?.titleRo} required />
      <Field label={f.titleRu} name="titleRu" defaultValue={q?.titleRu} required />
      <Field label={f.startsAt} name="startsAt" type="datetime-local" defaultValue={local(q?.startsAt ?? null)} />
      <Field label={f.endsAt} name="endsAt" type="datetime-local" defaultValue={local(q?.endsAt ?? null)} />
      <Field label={f.maxClaims} name="maxClaims" type="number" min={1} defaultValue={q?.maxClaims ?? ""} placeholder="∞" />
      <div className="flex items-end gap-6">
        <Check label={f.active} name="active" defaultChecked={q?.active ?? true} />
        <SubmitButton label={q ? t.common.save : t.common.create} />
      </div>
    </AdminForm>
  );
}

export default async function AdminQr() {
  const { locale, t } = await getT();
  await requireAdmin(locale);
  const [drops, counts, origin] = await Promise.all([
    db.select().from(schema.qrDrops).orderBy(desc(schema.qrDrops.createdAt)),
    db.select({ id: schema.qrClaims.qrId, n: sql<number>`count(*)::int` }).from(schema.qrClaims).groupBy(schema.qrClaims.qrId),
    publicOrigin(),
  ]);
  const countOf = new Map(counts.map((c) => [c.id, c.n]));
  const svgs = await Promise.all(drops.map((d) => qrSvg(`${origin}/${locale}/q/${d.code}`)));

  return (
    <>
      <PageTitle kicker="Sinners Club" title={t.admin.qr.title} />
      <p className="-mt-4 mb-8 max-w-2xl text-ink-soft">{t.admin.qr.lead}</p>
      <details className="group mb-8 rounded-2xl border border-dashed border-ink/20 p-5">
        <summary className="flex cursor-pointer list-none items-center gap-2 font-display text-2xl">
          <Plus size={18} className="transition-transform group-open:rotate-45" /> {t.admin.qr.add}
        </summary>
        <div className="mt-6">
          <QrForm t={t} />
        </div>
      </details>
      <div className="space-y-5">
        {drops.map((d, i) => {
          const url = `${origin}/${locale}/q/${d.code}`;
          return (
            <div key={d.id} className="grid gap-6 rounded-2xl border border-ink/10 bg-milk p-5 md:grid-cols-[200px_1fr]">
              <div>
                <div className="aspect-square rounded-xl bg-white p-3" dangerouslySetInnerHTML={{ __html: svgs[i] }} />
                <p className="mt-3 font-mono text-xs">
                  {countOf.get(d.id) ?? 0}
                  {d.maxClaims ? ` / ${d.maxClaims}` : ""} {t.admin.qr.claims}
                </p>
                <a href={url} target="_blank" rel="noreferrer" className="block truncate font-mono text-[10px] text-ink-soft underline">
                  {url}
                </a>
                <div className="mt-3 flex gap-2">
                  <Link href={`/${locale}/admin/qr/${d.id}/print`} className="btn btn-line btn-sm">
                    <Printer size={14} /> {t.admin.qr.print}
                  </Link>
                  <ActionButton action={deleteQr.bind(null, d.id)} confirm title={t.common.delete} className="grid size-9 place-items-center rounded-full text-cherry hover:bg-cherry/10">
                    <Trash size={16} />
                  </ActionButton>
                </div>
              </div>
              <QrForm q={d} t={t} />
            </div>
          );
        })}
      </div>
    </>
  );
}
