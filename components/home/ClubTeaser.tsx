import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { Dictionary } from "@/lib/i18n/dictionaries/ro";
import type { Locale } from "@/lib/i18n/config";
import { qrSvg, memberPayload } from "@/lib/qr";
import { TLink } from "@/components/motion/PageTransition";
import { Reveal } from "@/components/motion/Reveal";
import { Magnetic, Stagger } from "@/components/motion/Effects";
import { MemberCard } from "@/components/site/MemberCard";
import { StampRow } from "@/components/site/StampRow";
import { InkWings } from "@/components/art/Ink";

export async function ClubTeaser({ locale, t }: { locale: Locale; t: Dictionary }) {
  const qr = await qrSvg(memberPayload("SIN-DEMO"));

  return (
    <section className="relative overflow-hidden bg-night py-28 text-paper md:py-40">
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[60vw] w-[120vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-gilt/10" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[44vw] w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-gilt/10" />

      <div className="relative mx-auto grid max-w-[1600px] gap-16 px-5 md:px-10 lg:grid-cols-12 lg:items-center">
        <div className="min-w-0 lg:col-span-6">
          <p className="kicker text-gilt-soft">{t.home.clubKicker}</p>
          <h2 className="mt-8 text-giant">
            <Reveal as="span" className="block">
              {t.home.clubTitleA}
            </Reveal>
            <Reveal as="span" delay={0.12} className="block text-gilt italic">
              {t.home.clubTitleB}
            </Reveal>
          </h2>
          <p className="mt-8 max-w-lg leading-relaxed text-paper/70">{t.home.clubLead}</p>

          <Stagger className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-paper/10 bg-paper/10 sm:grid-cols-3">
            {t.home.clubSteps.map((step, i) => (
              <div key={step.title} className="bg-night p-6">
                <span className="font-mono text-[11px] tracking-[0.2em] text-gilt">{["I", "II", "III"][i]}</span>
                <p className="mt-4 font-display text-2xl leading-tight">{step.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-paper/60">{step.text}</p>
              </div>
            ))}
          </Stagger>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Magnetic>
              <TLink href={`/${locale}/register`} className="btn btn-gilt btn-lg">
                {t.home.clubCta}
                <ArrowRight size={16} />
              </TLink>
            </Magnetic>
            <span className="script text-2xl text-gilt-soft">{t.home.clubBonus}</span>
          </div>
        </div>

        <div className="relative min-w-0 lg:col-span-6">
          <InkWings className="pointer-events-none absolute -top-24 left-1/2 w-[62%] max-w-[360px] -translate-x-1/2 text-gilt/70" weight={1.1} />
          <div className="relative mx-auto max-w-[520px] animate-float">
            <MemberCard
              name="Ana"
              tierName={t.club.tiers.sinner.name}
              halos={612}
              memberCode="SIN-DEMO"
              qrSvg={qr}
              halosLabel={t.common.halosShort}
              flipLabel={t.account.flip}
              hint={t.account.cardHint}
            />
          </div>
          <div className="mx-auto mt-12 flex max-w-[520px] flex-wrap items-center justify-between gap-x-6 gap-y-4">
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-paper/50 uppercase">{t.account.stamps}</p>
              <p className="mt-1 text-sm text-paper/70">{t.club.stampsTitle}</p>
            </div>
            <StampRow filled={4} tone="dark" />
          </div>
        </div>
      </div>
    </section>
  );
}
