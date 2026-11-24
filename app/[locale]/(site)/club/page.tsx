import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowRight, Plus } from "@phosphor-icons/react/dist/ssr";
import { getCurrentUser } from "@/lib/auth";
import { getRewards } from "@/lib/data";
import { getT } from "@/lib/i18n/server";
import { pick, plural } from "@/lib/i18n/config";
import { TIERS } from "@/lib/loyalty";
import { qrSvg, memberPayload } from "@/lib/qr";
import { PageHeader } from "@/components/site/PageHeader";
import { MemberCard } from "@/components/site/MemberCard";
import { StampRow } from "@/components/site/StampRow";
import { ProductVisual } from "@/components/site/ProductVisual";
import { TLink } from "@/components/motion/PageTransition";
import { DrawOnScroll, Stagger } from "@/components/motion/Effects";
import { Reveal } from "@/components/motion/Reveal";
import { HaloGlyph } from "@/components/art/Wordmark";
import { InkWings } from "@/components/art/Ink";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: "Sinners Club", description: t.club.lead };
}

async function ClubCta() {
  const [user, { locale, t }] = await Promise.all([getCurrentUser(), getT()]);
  return (
    <TLink href={`/${locale}/${user ? "account" : "register"}`} className="btn btn-lg mt-8">
      {user ? t.club.open : t.club.join}
      <ArrowRight size={16} />
    </TLink>
  );
}

export default async function ClubPage() {
  const [{ locale, t }, rewards, qr] = await Promise.all([getT(), getRewards(), qrSvg(memberPayload("SIN-DEMO"))]);
  const cta = (
    <Suspense fallback={<div className="mt-8 h-14 w-52 rounded-full bg-ink/5" />}>
      <ClubCta />
    </Suspense>
  );

  return (
    <>
      <PageHeader kicker={t.club.kicker} title={t.club.title} lead={t.club.lead} aside={cta} />

      <section className="mx-auto grid max-w-[1600px] gap-16 px-5 py-16 md:px-10 lg:grid-cols-12 lg:items-center">
        <div className="relative lg:col-span-6">
          <InkWings className="pointer-events-none absolute -top-20 left-1/2 w-[60%] -translate-x-1/2 text-gilt" weight={1.1} />
          <MemberCard
            name="Ana"
            tierName={t.club.tiers.saint.name}
            halos={1640}
            memberCode="SIN-DEMO"
            qrSvg={qr}
            halosLabel={t.common.halosShort}
            flipLabel={t.account.flip}
            hint={t.account.cardHint}
            className="mx-auto max-w-[560px]"
          />
        </div>
        <div className="lg:col-span-6">
          <h2 className="text-huge">{t.club.howTitle}</h2>
          <Stagger className="mt-10 space-y-0">
            {t.club.how.map((step, i) => (
              <div key={step.title} className="grid grid-cols-[3.5rem_1fr] gap-4 border-t border-ink/10 py-6">
                <span className="font-display text-4xl text-gilt italic">{i + 1}</span>
                <div>
                  <p className="font-display text-2xl">{step.title}</p>
                  <p className="mt-1 text-ink-soft">{step.text}</p>
                </div>
              </div>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="mt-16 bg-night py-24 text-paper md:py-32">
        <div className="mx-auto grid max-w-[1600px] gap-10 px-5 md:px-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="kicker text-gilt-soft">☕ × 6</p>
            <Reveal as="h2" className="mt-6 text-giant">
              {t.club.stampsTitle}
            </Reveal>
            <p className="mt-6 max-w-md text-paper/70">{t.club.stampsText}</p>
          </div>
          <div className="flex flex-col items-start gap-6 lg:items-end">
            <StampRow filled={6} tone="dark" className="scale-150 origin-left lg:origin-right" />
            <p className="script text-3xl text-gilt-soft">+1 ☕</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-28 md:px-10 md:py-36">
        <Reveal as="h2" className="text-giant">
          {t.club.tiersTitle}
        </Reveal>
        <Stagger className="mt-14 grid gap-5 md:grid-cols-3">
          {TIERS.map((tier, i) => (
            <div
              key={tier.key}
              className={
                i === 2
                  ? "relative overflow-hidden rounded-[2rem] bg-night p-8 text-paper"
                  : "relative overflow-hidden rounded-[2rem] border border-ink/10 bg-milk p-8"
              }
            >
              <div className="flex gap-1">
                {Array.from({ length: i + 1 }, (_, k) => (
                  <HaloGlyph key={k} className="w-10 text-gilt" />
                ))}
              </div>
              <p className="mt-10 font-mono text-[11px] tracking-[0.2em] uppercase opacity-60">
                {tier.min}+ {t.common.halosShort}
              </p>
              <p className="mt-3 font-display text-5xl italic">{t.club.tiers[tier.key].name}</p>
              <p className="mt-4 leading-relaxed opacity-75">{t.club.tiers[tier.key].text}</p>
              {tier.multiplier > 1 && (
                <span className="absolute top-8 right-8 font-display text-3xl text-gilt">×{tier.multiplier}</span>
              )}
            </div>
          ))}
        </Stagger>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 pb-28 md:px-10">
        <h2 className="text-huge">{t.club.rewardsTitle}</h2>
        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.map((r) => (
            <div key={r.id} className="group flex items-center gap-5 rounded-[1.5rem] border border-ink/10 bg-milk p-4">
              <span className="size-24 shrink-0 overflow-hidden rounded-2xl">
                <ProductVisual image={r.image} alt={pick(r, "name", locale)} categorySlug="coffee" className="transition-transform duration-700 group-hover:scale-110" />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-2xl leading-tight">{pick(r, "name", locale)}</span>
                <span className="mt-2 flex items-center gap-2 font-mono text-sm text-cocoa">
                  <HaloGlyph className="w-6 text-gilt" />
                  {r.cost} {plural(locale, r.cost, t.common.halos)}
                </span>
              </span>
            </div>
          ))}
        </Stagger>
      </section>

      <section className="mx-auto grid max-w-[1600px] gap-12 border-t border-ink/10 px-5 py-28 md:px-10 lg:grid-cols-12">
        <h2 className="text-huge lg:col-span-4">{t.club.faqTitle}</h2>
        <div className="divide-y divide-ink/10 border-y border-ink/10 lg:col-span-8">
          {t.club.faq.map((f) => (
            <details key={f.q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-2xl md:text-3xl">
                {f.q}
                <Plus size={20} weight="light" className="shrink-0 transition-transform duration-500 group-open:rotate-45" />
              </summary>
              <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <DrawOnScroll className="mx-auto max-w-[1600px] px-5 pb-32 text-center md:px-10">
        <InkWings className="mx-auto w-48 text-gilt" weight={1.2} />
        <p className="mt-6 font-display text-[clamp(2.4rem,5vw,4.5rem)] leading-none italic">{t.home.clubTitleA} {t.home.clubTitleB}</p>
        <div className="flex justify-center">{cta}</div>
      </DrawOnScroll>
    </>
  );
}
