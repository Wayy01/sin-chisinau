import type { Dictionary } from "@/lib/i18n/dictionaries/ro";
import { pick, type Locale } from "@/lib/i18n/config";
import type { MenuItem } from "@/db/schema";
import { TLink } from "@/components/motion/PageTransition";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax, Stagger } from "@/components/motion/Effects";
import { InkSteam } from "@/components/art/Ink";

export function Season({ locale, t, items }: { locale: Locale; t: Dictionary; items: MenuItem[] }) {
  return (
    <section className="relative overflow-hidden bg-sage-deep text-paper">
      <div className="mx-auto grid max-w-[1600px] gap-14 px-5 py-28 md:px-10 md:py-36 lg:grid-cols-12 lg:items-center">
        <div className="relative lg:col-span-5">
          <Parallax speed={0.18} className="relative mx-auto w-[80%] max-w-[420px]">
            <div className="relative aspect-[9/14] overflow-hidden rounded-[999px_999px_2rem_2rem] ring-1 ring-paper/20" data-cursor="♾">
              <video
                className="h-full w-full object-cover"
                src="/media/video/autumn-drinks.mp4"
                poster="/media/video/autumn-drinks.jpg"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            </div>
            <InkSteam className="absolute -top-10 -right-8 w-20 text-paper/70" weight={1.3} />
          </Parallax>
        </div>

        <div className="lg:col-span-7 lg:pl-10">
          <p className="kicker text-paper/70">{t.home.seasonKicker}</p>
          <Reveal as="h2" className="mt-6 text-giant italic">
            {t.home.seasonTitle}
          </Reveal>
          <p className="mt-6 max-w-lg leading-relaxed text-paper/75">{t.home.seasonLead}</p>

          <Stagger className="mt-12 divide-y divide-paper/15 border-y border-paper/15">
            {items.map((item) => (
              <TLink key={item.id} href={`/${locale}/menu#${item.slug}`} className="group flex items-baseline gap-4 py-5">
                <span className="font-display text-[1.9rem] leading-none transition-transform duration-500 group-hover:translate-x-2">
                  {pick(item, "name", locale)}
                </span>
                <span className="leader" />
                <span className="font-mono text-sm tabular">
                  {item.price} {t.common.lei}
                </span>
              </TLink>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
