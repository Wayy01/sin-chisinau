import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { formatDate } from "@/lib/i18n/config";
import { tierFor } from "@/lib/loyalty";
import { adjustHalos } from "@/lib/admin/actions";
import { AdminForm, SubmitButton } from "@/components/admin/AdminForm";
import { Card, Field, PageTitle } from "@/components/admin/fields";
import { RoleSelect } from "@/components/admin/RoleSelect";
import { StampRow } from "@/components/site/StampRow";
import { HaloGlyph } from "@/components/art/Wordmark";
import { cn } from "@/lib/cn";

export default async function MemberDetail({ params }: PageProps<"/[locale]/admin/members/[id]">) {
  const [{ id }, { locale, t }, me] = await Promise.all([params, getT(), getCurrentUser()]);
  if (!z.uuid().safeParse(id).success) notFound();
  const [[m], ledger, vouchers] = await Promise.all([
    db.select().from(schema.users).where(eq(schema.users.id, id)),
    db.select().from(schema.ledger).where(eq(schema.ledger.userId, id)).orderBy(desc(schema.ledger.createdAt)).limit(100),
    db.select().from(schema.redemptions).where(eq(schema.redemptions.userId, id)).orderBy(desc(schema.redemptions.createdAt)).limit(50),
  ]);
  if (!m) notFound();
  const isAdmin = me?.role === "admin";
  const { tier } = tierFor(m.halosLifetime);

  return (
    <>
      <PageTitle kicker={`${m.memberCode} · ${m.email}`} title={m.name} action={isAdmin && me.id !== m.id ? <RoleSelect userId={m.id} role={m.role} /> : undefined} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <p className="font-mono text-[10px] tracking-[0.15em] text-ink-soft uppercase">{t.account.balance}</p>
          <p className="mt-2 flex items-center gap-3 font-display text-6xl tabular">
            {m.halos} <HaloGlyph className="w-12 text-gilt" />
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            {m.halosLifetime} {t.account.lifetime} · {t.club.tiers[tier.key].name}
          </p>
          <StampRow filled={m.stamps} className="mt-5" />
          <dl className="mt-6 space-y-1 text-sm text-ink-soft">
            {m.phone && <dd>{m.phone}</dd>}
            {m.birthday && <dd>🎂 {m.birthday}</dd>}
            <dd>
              {t.admin.members.joined} {formatDate(m.createdAt, locale)}
            </dd>
          </dl>
        </Card>

        {isAdmin && (
          <Card title={t.admin.members.adjust}>
            <AdminForm action={adjustHalos} resetOnSuccess className="space-y-4">
              <input type="hidden" name="userId" value={m.id} />
              <Field label="± " name="delta" type="number" required placeholder="+50 / -20" />
              <Field label={t.admin.members.reason} name="note" />
              <SubmitButton label={t.admin.members.apply} />
            </AdminForm>
          </Card>
        )}

        <Card title={t.account.vouchers}>
          {vouchers.length === 0 ? (
            <p className="text-sm text-ink-soft">{t.account.noVouchers}</p>
          ) : (
            <ul className="divide-y divide-ink/10 text-sm">
              {vouchers.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate">{v.label}</span>
                    <span className="font-mono text-[11px] text-ink-soft">{v.code}</span>
                  </span>
                  <span className={cn("rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase", v.status === "pending" ? "bg-gilt/20" : "bg-ink/10 text-ink-soft")}>
                    {v.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title={t.account.history} className="mt-6">
        <ul className="divide-y divide-ink/10">
          {ledger.map((l) => (
            <li key={l.id} className="flex items-center gap-4 py-3 text-sm">
              <span className="w-40 shrink-0 font-mono text-[11px] text-ink-soft">
                {formatDate(l.createdAt, locale, { day: "numeric", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className="flex-1">
                {t.account.kinds[l.kind]}
                {l.amountLei ? ` · ${l.amountLei} ${t.common.lei}` : ""}
                {l.note ? <span className="text-ink-soft"> · {l.note}</span> : null}
              </span>
              <span className={cn("font-display text-xl tabular", l.delta >= 0 ? "text-sage-deep" : "text-cherry")}>
                {l.delta > 0 ? "+" : ""}
                {l.delta}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
