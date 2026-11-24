import { ArrowUpRight, Phone } from "@phosphor-icons/react/dist/ssr";
import type { Dictionary } from "@/lib/i18n/dictionaries/ro";
import type { SiteSettings } from "@/lib/data";
import { Reveal } from "@/components/motion/Reveal";
import { DrawOnScroll, Parallax } from "@/components/motion/Effects";
import { InkArrow, InkPaw, InkScribble } from "@/components/art/Ink";
import { OpenStatus } from "@/components/site/OpenStatus";

export function Visit({ t, settings }: { t: Dictionary; settings: SiteSettings }) {
  return (
    <section className="relative overflow-hidden py-28 md:py-40">
      <div className="mx-auto grid max-w-[1600px] gap-16 px-5 md:px-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-6">
          <p className="kicker text-gilt">{t.home.visitKicker}</p>
          <Reveal as="h2" className="mt-6 text-giant">
            {t.home.visitTitle}
          </Reveal>
          <p className="mt-6 max-w-md leading-relaxed text-ink-soft">{t.home.visitLead}</p>

          <dl className="mt-12 grid gap-8 sm:grid-cols-2">
            <div>
              <dt className="kicker text-ink-soft">{t.visit.address}</dt>
              <dd className="mt-3 font-display text-2xl leading-tight">{settings.address}</dd>
            </div>
            <div>
              <dt className="kicker text-ink-soft">{t.visit.hours}</dt>
              <dd className="mt-3 font-display text-2xl leading-tight">
                {t.common.daily}, {settings.hours}
              </dd>
              <OpenStatus hours={settings.hours} className="mt-3 text-ink-soft" />
            </div>
          </dl>

          <div className="mt-12 flex flex-wrap gap-3">
            <a href={settings.mapsUrl} target="_blank" rel="noreferrer" className="btn">
              {t.visit.directions}
              <ArrowUpRight size={16} />
            </a>
            <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="btn btn-line">
              <Phone size={16} weight="light" />
              {settings.phone}
            </a>
          </div>
        </div>

        <div className="relative lg:col-span-6">
          <Parallax speed={0.12}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/img/storefront.webp" alt="SIN, str. 31 August 1989, 113" className="h-full w-full object-cover" loading="lazy" />
            </div>
          </Parallax>
          <DrawOnScroll className="pointer-events-none absolute -bottom-10 -left-4 flex items-end gap-2 text-cocoa md:-left-16">
            <InkPaw className="w-14 -rotate-12" weight={1.3} />
            <div className="relative">
              <InkScribble className="absolute -inset-x-5 -inset-y-3 h-[calc(100%+1.5rem)] w-[calc(100%+2.5rem)] text-cherry" weight={1.4} />
              <span className="script relative text-2xl whitespace-nowrap">Pet-friendly</span>
            </div>
            <InkArrow className="mb-6 w-16 -rotate-[30deg]" weight={1.3} />
          </DrawOnScroll>
        </div>
      </div>

      <div className="mx-auto mt-24 grid max-w-[1600px] gap-px px-5 sm:grid-cols-2 md:px-10 lg:grid-cols-4">
        {t.visit.perks.map((perk, i) => (
          <div key={perk.title} className="border-t border-ink/15 pt-6 pr-6 pb-2">
            <span className="font-mono text-[11px] text-gilt">0{i + 1}</span>
            <p className="mt-3 font-display text-2xl">{perk.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{perk.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
