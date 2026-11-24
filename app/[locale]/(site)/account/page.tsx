import type { Metadata } from "next";
import { Suspense } from "react";
import { and, desc, eq } from "drizzle-orm";
import { SignOut } from "@phosphor-icons/react/dist/ssr";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { getRewards } from "@/lib/data";
import { getT } from "@/lib/i18n/server";
import { formatDate, pick, plural } from "@/lib/i18n/config";
import { maybeBirthdayBonus, STAMPS_FOR_FREE_COFFEE, tierFor } from "@/lib/loyalty";
import { memberPayload, qrSvg, voucherPayload } from "@/lib/qr";
import { logout } from "@/lib/actions/auth";
import { MemberCard } from "@/components/site/MemberCard";
import { StampRow } from "@/components/site/StampRow";
import { ProductVisual } from "@/components/site/ProductVisual";
import { Counter } from "@/components/motion/Effects";
import { Reveal } from "@/components/motion/Reveal";
import { TLink } from "@/components/motion/PageTransition";
import { RedeemButton } from "@/components/account/RedeemButton";
import { ProfileForm } from "@/components/account/ProfileForm";
import { HaloGlyph } from "@/components/art/Wordmark";
import { InkSparkle } from "@/components/art/Ink";
import { cn } from "@/lib/cn";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t.nav.account, robots: { index: false } };
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <Account />
    </Suspense>
  );
}

async function Account() {
  const { locale, t } = await getT();
  let user = await requireUser(locale, `/${locale}/account`);
  const birthday = await maybeBirthdayBonus(user);
  if (birthday) user = { ...user, halos: user.halos + 100, halosLifetime: user.halosLifetime + 100 };

  const [rewards, history, vouchers, favs, cardQr] = await Promise.all([
    getRewards(),
    db.select().from(schema.ledger).where(eq(schema.ledger.userId, user.id)).orderBy(desc(schema.ledger.createdAt)).limit(25),
    db
      .select()
      .from(schema.redemptions)
      .where(and(eq(schema.redemptions.userId, user.id), eq(schema.redemptions.status, "pending")))
      .orderBy(desc(schema.redemptions.createdAt)),
    db
      .select({ item: schema.menuItems })
      .from(schema.favorites)
      .innerJoin(schema.menuItems, eq(schema.menuItems.id, schema.favorites.itemId))
      .where(eq(schema.favorites.userId, user.id)),
    qrSvg(memberPayload(user.memberCode)),
  ]);
  const voucherQrs = await Promise.all(vouchers.map((v) => qrSvg(voucherPayload(v.code))));

  const { tier, next, progress } = tierFor(user.halosLifetime);
  const tierName = t.club.tiers[tier.key].name;
  const halosWord = (n: number) => plural(locale, n, t.common.halos);
  const firstName = user.name.split(" ")[0];

  return (
    <div className="mx-auto max-w-[1600px] px-5 pt-32 pb-24 md:px-10 md:pt-44">
      <p className="kicker text-gilt">{t.account.kicker}</p>
      <Reveal as="h1" on="intro" className="mt-6 text-[clamp(3.2rem,8vw,8rem)] leading-[0.9]">
        {`${t.account.hello}, ${firstName}.`}
      </Reveal>

      {birthday && (
        <p className="mt-8 inline-flex items-center gap-3 rounded-full bg-cherry px-5 py-3 text-milk">
          <InkSparkle className="w-5" /> {t.account.birthdayBonus}
        </p>
      )}

      <div className="mt-14 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <MemberCard
            name={user.name}
            tierName={tierName}
            halos={user.halos}
            memberCode={user.memberCode}
            qrSvg={cardQr}
            halosLabel={t.common.halosShort}
            flipLabel={t.account.flip}
            hint={t.account.cardHint}
            className="max-w-[620px]"
          />
          <p className="mt-5 flex items-center gap-2 text-sm text-ink-soft">
            <span className="script text-xl text-cocoa">↻</span> {t.account.flip} · {t.account.cardHint}
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-5">
          <div className="rounded-[1.75rem] border border-ink/10 bg-milk p-7">
            <p className="kicker text-ink-soft">{t.account.balance}</p>
            <p className="mt-4 flex items-end gap-4">
              <Counter value={user.halos} className="font-display text-7xl leading-none tabular" />
              <HaloGlyph className="mb-3 w-14 text-gilt" />
            </p>
            <p className="mt-3 text-sm text-ink-soft">
              {user.halosLifetime} {t.account.lifetime}
            </p>
            <div className="mt-8">
              <div className="flex justify-between font-mono text-[11px] tracking-[0.15em] uppercase">
                <span>
                  {t.account.tier}: <span className="text-cocoa">{tierName}</span>
                </span>
                {next && (
                  <span className="text-ink-soft">
                    {next.min - user.halosLifetime} {t.account.nextTier} {t.club.tiers[next.key].name}
                  </span>
                )}
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/10">
                <div className="h-full rounded-full bg-gradient-to-r from-gilt to-cherry" style={{ width: `${Math.max(4, progress * 100)}%` }} />
              </div>
              {!next && <p className="mt-3 text-sm text-ink-soft">{t.account.topTier}</p>}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-ink/10 bg-milk p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="kicker text-ink-soft">{t.account.stamps}</p>
                <p className="mt-2 text-sm text-ink-soft">{t.account.stampsHint}</p>
              </div>
              <span className="font-display text-3xl tabular">
                {user.stamps}/{STAMPS_FOR_FREE_COFFEE}
              </span>
            </div>
            <StampRow filled={user.stamps} className="mt-5" />
          </div>

          <p className="rounded-[1.75rem] border border-dashed border-ink/20 p-6 text-sm leading-relaxed text-ink-soft">{t.account.scanQr}</p>
        </div>
      </div>

      <section id="vouchers" className="mt-24">
        <h2 className="text-big">{t.account.vouchers}</h2>
        <p className="mt-3 text-ink-soft">{t.account.voucherHint}</p>
        {vouchers.length === 0 ? (
          <p className="mt-8 font-display text-2xl text-ink-soft italic">{t.account.noVouchers}</p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {vouchers.map((v, i) => (
              <div key={v.id} className="relative flex items-center gap-5 overflow-hidden rounded-[1.5rem] bg-night p-5 text-paper">
                <div className="size-28 shrink-0 rounded-xl bg-milk p-2" dangerouslySetInnerHTML={{ __html: voucherQrs[i] }} />
                <div className="min-w-0">
                  <p className="font-display text-xl leading-tight">{v.label.split(" / ")[locale === "ro" ? 0 : 1] ?? v.label}</p>
                  <p className="mt-3 font-mono text-2xl tracking-[0.3em] text-gilt">{v.code}</p>
                  <p className="mt-1 font-mono text-[10px] tracking-[0.15em] text-paper/50 uppercase">{formatDate(v.createdAt, locale)}</p>
                </div>
                <span className="absolute top-1/2 -left-3 size-6 -translate-y-1/2 rounded-full bg-paper" />
                <span className="absolute top-1/2 -right-3 size-6 -translate-y-1/2 rounded-full bg-paper" />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-big">{t.account.rewards}</h2>
          <TLink href={`/${locale}/club`} className="ink-underline text-sm text-ink-soft">
            Sinners Club →
          </TLink>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {rewards.map((r) => {
            const affordable = user.halos >= r.cost;
            return (
              <div key={r.id} className={cn("flex flex-col overflow-hidden rounded-[1.5rem] border border-ink/10 bg-milk", !affordable && "opacity-80")}>
                <div className="aspect-[4/3] overflow-hidden">
                  <ProductVisual image={r.image} alt={pick(r, "name", locale)} categorySlug="coffee" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="font-display text-xl leading-tight">{pick(r, "name", locale)}</p>
                  <p className="mt-1 flex-1 text-xs leading-relaxed text-ink-soft">{pick(r, "desc", locale)}</p>
                  <p className="mt-4 flex items-center gap-2 font-mono text-sm">
                    <HaloGlyph className="w-6 text-gilt" />
                    {r.cost} {halosWord(r.cost)}
                  </p>
                  <div className="mt-4">
                    <RedeemButton rewardId={r.id} affordable={affordable} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-24 grid gap-16 lg:grid-cols-2">
        <section>
          <h2 className="text-big">{t.account.history}</h2>
          {history.length === 0 ? (
            <p className="mt-8 font-display text-2xl text-ink-soft italic">{t.account.noHistory}</p>
          ) : (
            <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
              {history.map((h) => (
                <li key={h.id} className="flex items-center gap-4 py-4">
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", h.delta >= 0 ? "bg-gilt/15 text-cocoa" : "bg-cherry/10 text-cherry")}>
                    <HaloGlyph className="w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block">{t.account.kinds[h.kind]}</span>
                    <span className="block font-mono text-[11px] text-ink-soft">
                      {formatDate(h.createdAt, locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      {h.amountLei ? ` · ${h.amountLei} ${t.common.lei}` : ""}
                      {h.note ? ` · ${h.note}` : ""}
                    </span>
                  </span>
                  <span className={cn("font-display text-2xl tabular", h.delta >= 0 ? "text-sage-deep" : "text-cherry")}>
                    {h.delta > 0 ? "+" : ""}
                    {h.delta}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-big">{t.account.favorites}</h2>
          {favs.length === 0 ? (
            <p className="mt-8 max-w-sm font-display text-2xl text-ink-soft italic">{t.account.noFavorites}</p>
          ) : (
            <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {favs.map(({ item }) => (
                <li key={item.id}>
                  <TLink href={`/${locale}/menu#${item.slug}`} className="group block">
                    <span className="block aspect-square overflow-hidden rounded-2xl">
                      <ProductVisual image={item.image} alt={pick(item, "name", locale)} className="transition-transform duration-700 group-hover:scale-105" />
                    </span>
                    <span className="mt-2 block font-display text-lg leading-tight">{pick(item, "name", locale)}</span>
                    <span className="font-mono text-xs text-ink-soft">
                      {item.price} {t.common.lei}
                    </span>
                  </TLink>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-16">
            <h2 className="text-big">{t.account.profile}</h2>
            <p className="mt-2 font-mono text-xs text-ink-soft">{user.email}</p>
            <div className="mt-8">
              <ProfileForm name={user.name} phone={user.phone} birthday={user.birthday} />
            </div>
            <form action={logout} className="mt-10">
              <input type="hidden" name="locale" value={locale} />
              <button type="submit" className="inline-flex items-center gap-2 text-sm text-cherry hover:underline">
                <SignOut size={16} /> {t.auth.logout}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
