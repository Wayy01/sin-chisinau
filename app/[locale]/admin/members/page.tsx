import Link from "next/link";
import { desc, ilike, or } from "drizzle-orm";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { db, schema } from "@/db";
import { requireStaff } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { formatDate } from "@/lib/i18n/config";
import { tierFor } from "@/lib/loyalty";
import { PageTitle } from "@/components/admin/fields";
import { cn } from "@/lib/cn";

export default async function AdminMembers({ searchParams }: PageProps<"/[locale]/admin/members">) {
  const [{ q }, { locale, t }] = await Promise.all([searchParams, getT()]);
  await requireStaff(locale);
  const query = typeof q === "string" ? q.trim() : "";
  const pattern = `%${query}%`;
  const members = await db
    .select()
    .from(schema.users)
    .where(query ? or(ilike(schema.users.name, pattern), ilike(schema.users.email, pattern), ilike(schema.users.memberCode, pattern)) : undefined)
    .orderBy(desc(schema.users.createdAt))
    .limit(200);

  return (
    <>
      <PageTitle kicker="Sinners Club" title={t.admin.members.title} />
      <form className="mb-6 flex max-w-xl items-center gap-3 rounded-full border border-ink/15 bg-milk px-5">
        <MagnifyingGlass size={18} className="text-ink-soft" />
        <input name="q" defaultValue={query} placeholder={t.admin.members.search} className="h-12 w-full bg-transparent outline-none" />
      </form>
      <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-milk">
        <table className="w-full text-sm md:min-w-[820px]">
          <thead className="font-mono text-[10px] tracking-[0.15em] text-ink-soft uppercase">
            <tr className="text-left">
              <th className="px-5 py-3 font-normal">{t.auth.name}</th>
              <th className="hidden px-3 py-3 font-normal md:table-cell">{t.admin.fields.code}</th>
              <th className="px-3 py-3 font-normal">{t.account.tier}</th>
              <th className="px-3 py-3 text-right font-normal">{t.common.halosShort}</th>
              <th className="hidden px-3 py-3 text-right font-normal md:table-cell">{t.account.lifetime}</th>
              <th className="hidden px-3 py-3 font-normal md:table-cell">☕</th>
              <th className="hidden px-5 py-3 font-normal md:table-cell">{t.admin.members.joined}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-paper/60">
                <td className="px-5 py-3">
                  <Link href={`/${locale}/admin/members/${m.id}`} className="font-medium hover:underline">
                    {m.name}
                  </Link>
                  <p className="text-xs break-all text-ink-soft">{m.email}</p>
                  <p className="font-mono text-[11px] text-ink-soft md:hidden">{m.memberCode}</p>
                </td>
                <td className="hidden px-3 py-3 font-mono text-xs md:table-cell">{m.memberCode}</td>
                <td className="px-3 py-3">
                  <span className="rounded-full border border-gilt/40 px-2.5 py-0.5 text-xs">{t.club.tiers[tierFor(m.halosLifetime).tier.key].name}</span>
                  {m.role !== "member" && (
                    <span className={cn("ml-2 rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase", m.role === "admin" ? "bg-ink text-paper" : "bg-sage-deep text-paper")}>
                      {m.role}
                    </span>
                  )}
                </td>
                <td className="px-3 py-3 text-right font-display text-xl tabular">{m.halos}</td>
                <td className="hidden px-3 py-3 text-right font-mono text-xs text-ink-soft tabular md:table-cell">{m.halosLifetime}</td>
                <td className="hidden px-3 py-3 font-mono text-xs md:table-cell">{m.stamps}/6</td>
                <td className="hidden px-5 py-3 font-mono text-xs text-ink-soft md:table-cell">{formatDate(m.createdAt, locale, { day: "numeric", month: "short", year: "numeric" })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
