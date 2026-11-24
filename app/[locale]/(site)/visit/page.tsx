import type { Metadata } from "next";
import { ArrowUpRight, Clock, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import { getSettings } from "@/lib/data";
import { getT } from "@/lib/i18n/server";
import { PageHeader } from "@/components/site/PageHeader";
import { OpenStatus } from "@/components/site/OpenStatus";
import { DrawOnScroll, Stagger } from "@/components/motion/Effects";
import { InkCup, InkPaw, InkSteam, InkWheat } from "@/components/art/Ink";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t.visit.kicker, description: t.home.visitLead };
}

const perkInk = [InkPaw, InkSteam, InkCup, InkWheat];

export default async function VisitPage() {
  const [{ t }, settings] = await Promise.all([getT(), getSettings()]);
  const mapQuery = encodeURIComponent("SIN, Strada 31 August 1989 113, Chișinău");

  return (
    <>
      <PageHeader kicker={t.visit.kicker} title={t.visit.title} lead={t.visit.landmark} />

      <section className="mx-auto grid max-w-[1600px] gap-6 px-5 md:px-10 lg:grid-cols-12">
        <div className="relative overflow-hidden rounded-[2rem] border border-ink/10 lg:col-span-8">
          <iframe
            title={settings.address}
            src={`https://www.google.com/maps?q=${mapQuery}&z=17&output=embed`}
            className="h-[420px] w-full [filter:grayscale(.55)_sepia(.35)_contrast(1.05)] md:h-[620px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="flex flex-col gap-6 lg:col-span-4">
          <div className="rounded-[2rem] bg-night p-8 text-paper">
            <MapPin size={22} weight="light" className="text-gilt" />
            <p className="mt-6 font-mono text-[11px] tracking-[0.2em] text-paper/50 uppercase">{t.visit.address}</p>
            <p className="mt-2 font-display text-3xl leading-tight">{settings.address}</p>
            <a href={settings.mapsUrl} target="_blank" rel="noreferrer" className="btn btn-gilt btn-sm mt-8">
              {t.visit.directions} <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="rounded-[2rem] border border-ink/10 bg-milk p-8">
            <Clock size={22} weight="light" className="text-gilt" />
            <p className="mt-6 font-mono text-[11px] tracking-[0.2em] text-ink-soft uppercase">{t.visit.hours}</p>
            <p className="mt-2 font-display text-3xl">
              {t.common.daily}, {settings.hours}
            </p>
            <OpenStatus hours={settings.hours} className="mt-4 text-ink-soft" />
          </div>
          <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="group rounded-[2rem] border border-ink/10 bg-milk p-8 transition-colors hover:border-gilt">
            <Phone size={22} weight="light" className="text-gilt" />
            <p className="mt-6 font-mono text-[11px] tracking-[0.2em] text-ink-soft uppercase">{t.visit.phone}</p>
            <p className="mt-2 font-display text-3xl transition-colors group-hover:text-cocoa">{settings.phone}</p>
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-28 md:px-10">
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.visit.perks.map((perk, i) => {
            const Ink = perkInk[i];
            return (
              <DrawOnScroll key={perk.title} className="rounded-[2rem] border border-ink/10 p-8">
                <Ink className="h-16 w-auto text-cocoa" weight={1.3} />
                <p className="mt-8 font-display text-3xl">{perk.title}</p>
                <p className="mt-3 leading-relaxed text-ink-soft">{perk.text}</p>
              </DrawOnScroll>
            );
          })}
        </Stagger>
      </section>

      <section className="mx-auto grid max-w-[1600px] gap-6 px-5 pb-32 md:grid-cols-2 md:px-10">
        <div className="aspect-[4/3] overflow-hidden rounded-[2rem]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/img/storefront.webp" alt="SIN" loading="lazy" className="h-full w-full object-cover" />
        </div>
        <div className="aspect-[4/3] overflow-hidden rounded-[2rem]">
          <video src="/media/video/rainy-day.mp4" poster="/media/video/rainy-day.jpg" autoPlay muted loop playsInline preload="metadata" className="h-full w-full object-cover" />
        </div>
      </section>
    </>
  );
}
