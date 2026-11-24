import { desc, eq, gte, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { formatDate } from "@/lib/i18n/config";
import { PageTitle, Card } from "@/components/admin/fields";
import { HaloGlyph } from "@/components/art/Wordmark";
import { cn } from "@/lib/cn";

const DAYS = 14;

function windowStart() {
  const since = new Date(Date.now() - (DAYS - 1) * 864e5);
  since.setHours(0, 0, 0, 0);
  return since;
}

export default async function Overview() {
  const { locale, t } = await getT();
  await requireAdmin(locale);
  const since = windowStart();

  const [[members], [issued], [used], [posts], [items], [revenue], daily, recent] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(schema.users),
    db.select({ n: sql<number>`coalesce(sum(delta),0)::int` }).from(schema.ledger).where(sql`delta > 0`),
    db.select({ n: sql<number>`count(*)::int` }).from(schema.redemptions).where(eq(schema.redemptions.status, "used")),
    db.select({ n: sql<number>`count(*)::int` }).from(schema.posts).where(eq(schema.posts.published, true)),
    db.select({ n: sql<number>`count(*)::int` }).from(schema.menuItems),
    db.select({ n: sql<number>`coalesce(sum(amount_lei),0)::int` }).from(schema.ledger).where(eq(schema.ledger.kind, "purchase")),
    db
      .select({
        day: sql<string>`to_char(date_trunc('day', created_at at time zone 'Europe/Chisinau'), 'YYYY-MM-DD')`,
        halos: sql<number>`coalesce(sum(case when delta > 0 then delta end),0)::int`,
        lei: sql<number>`coalesce(sum(amount_lei),0)::int`,
      })
      .from(schema.ledger)
      .where(gte(schema.ledger.createdAt, since))
      .groupBy(sql`1`),
    db
      .select({ l: schema.ledger, name: schema.users.name })
      .from(schema.ledger)
      .innerJoin(schema.users, eq(schema.users.id, schema.ledger.userId))
      .orderBy(desc(schema.ledger.createdAt))
      .limit(12),
  ]);

  const byDay = new Map(daily.map((d) => [d.day, d]));
  const series = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(since.getTime() + i * 864e5);
    const key = d.toLocaleDateString("sv-SE", { timeZone: "Europe/Chisinau" });
    return { key, date: d, halos: byDay.get(key)?.halos ?? 0, lei: byDay.get(key)?.lei ?? 0 };
  });
  const maxLei = Math.max(100, ...series.map((s) => s.lei));
  const maxHalos = Math.max(10, ...series.map((s) => s.halos));

  const stats = [
    { label: t.admin.overview.members, value: members.n },
    { label: t.admin.overview.halosIssued, value: issued.n, halo: true },
    { label: t.admin.overview.revenue, value: `${revenue.n.toLocaleString("ro-MD")} ${t.common.lei}` },
    { label: t.admin.overview.redemptions, value: used.n },
    { label: t.admin.overview.posts, value: posts.n },
    { label: t.admin.overview.items, value: items.n },
  ];

  return (
    <>
      <PageTitle kicker={formatDate(series[DAYS - 1].date, locale)} title={t.admin.nav.overview} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-ink/10 bg-milk p-5">
            <p className="font-mono text-[10px] tracking-[0.16em] text-ink-soft uppercase">{s.label}</p>
            <p className="mt-3 flex items-center gap-2 font-display text-4xl leading-none tabular">
              {s.value}
              {s.halo && <HaloGlyph className="w-8 text-gilt" />}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Card title={t.admin.overview.week} className="xl:col-span-3">
          <div className="mb-4 flex gap-5 font-mono text-[10px] tracking-[0.15em] text-ink-soft uppercase">
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-sm bg-ink" /> {t.admin.overview.revenue}
            </span>
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-gilt" /> {t.admin.overview.halosIssued}
            </span>
          </div>
          <svg viewBox={`0 0 ${DAYS * 40} 220`} className="h-64 w-full" preserveAspectRatio="none" role="img" aria-label={t.admin.overview.week}>
            {[0.25, 0.5, 0.75, 1].map((f) => (
              <line key={f} x1="0" x2={DAYS * 40} y1={200 - f * 180} y2={200 - f * 180} stroke="currentColor" className="text-ink/10" strokeDasharray="3 4" />
            ))}
            {series.map((s, i) => {
              const h = (s.lei / maxLei) * 180;
              return (
                <g key={s.key}>
                  <rect x={i * 40 + 8} y={200 - h} width="24" height={Math.max(h, 1)} rx="5" className="fill-ink">
                    <title>{`${s.key}: ${s.lei} lei · ${s.halos} halos`}</title>
                  </rect>
                </g>
              );
            })}
            <polyline
              fill="none"
              stroke="var(--color-gilt)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              points={series.map((s, i) => `${i * 40 + 20},${200 - (s.halos / maxHalos) * 180}`).join(" ")}
            />
            {series.map((s, i) => (
              <circle key={s.key} cx={i * 40 + 20} cy={200 - (s.halos / maxHalos) * 180} r="3.5" fill="var(--color-milk)" stroke="var(--color-gilt)" strokeWidth="2" />
            ))}
          </svg>
          <div className="mt-2 flex justify-between font-mono text-[10px] text-ink-soft">
            <span>{formatDate(series[0].date, locale, { day: "numeric", month: "short" })}</span>
            <span>{formatDate(series[DAYS - 1].date, locale, { day: "numeric", month: "short" })}</span>
          </div>
        </Card>

        <Card title={t.admin.overview.activity} className="xl:col-span-2">
          <ul className="divide-y divide-ink/10">
            {recent.map(({ l, name }) => (
              <li key={l.id} className="flex items-center gap-3 py-3 text-sm">
                <span className={cn("grid size-8 place-items-center rounded-full", l.delta >= 0 ? "bg-gilt/15" : "bg-cherry/10")}>
                  <HaloGlyph className={cn("w-4", l.delta >= 0 ? "text-cocoa" : "text-cherry")} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate">
                    {name} · <span className="text-ink-soft">{t.account.kinds[l.kind]}</span>
                  </span>
                  <span className="font-mono text-[10px] text-ink-soft">
                    {formatDate(l.createdAt, locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    {l.amountLei ? ` · ${l.amountLei} ${t.common.lei}` : ""}
                  </span>
                </span>
                <span className={cn("font-display text-xl tabular", l.delta >= 0 ? "text-sage-deep" : "text-cherry")}>
                  {l.delta > 0 ? "+" : ""}
                  {l.delta}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
