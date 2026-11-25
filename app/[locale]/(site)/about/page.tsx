import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import { PageHeader } from "@/components/site/PageHeader";
import { ReelStrip } from "@/components/site/ReelStrip";
import { Reveal } from "@/components/motion/Reveal";
import { DrawOnScroll, Parallax, Stagger } from "@/components/motion/Effects";
import { InkCroissant, InkCup, InkPaw, InkWings, PaintWash } from "@/components/art/Ink";
import { cn } from "@/lib/cn";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t.about.kicker, description: t.about.lead };
}

const chapterArt = [
  { image: "/media/img/vitrine.webp", Ink: InkCroissant },
  { image: "/media/img/latte-pour.webp", Ink: InkCup },
  { image: "/media/art/peeters.webp", Ink: InkWings },
  { image: "/media/img/storefront.webp", Ink: InkPaw },
];

export default async function AboutPage() {
  const { t } = await getT();

  return (
    <>
      <PageHeader kicker={t.about.kicker} title={t.about.title} lead={t.about.lead} />

      <section className="relative mx-auto grid max-w-[1600px] grid-cols-12 gap-4 px-5 pb-24 md:px-10">
        <div className="pointer-events-none absolute inset-x-0 top-10 -z-10 mx-auto w-[80%] text-gilt-soft opacity-70">
          <PaintWash className="w-full" />
        </div>
        <Parallax speed={0.08} className="col-span-12 md:col-span-6">
          <div className="arch aspect-[4/5] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/media/img/danish.webp" alt="" className="h-full w-full object-cover" />
          </div>
        </Parallax>
        <div className="col-span-12 flex flex-col gap-4 md:col-span-6 md:pt-40">
          <Parallax speed={0.2}>
            <div className="aspect-[4/3] overflow-hidden rounded-[2rem]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/img/bag-logo.webp" alt="" className="h-full w-full object-cover object-[50%_30%]" />
            </div>
          </Parallax>
          <Stagger className="mt-10 grid grid-cols-3 gap-4 border-t border-ink/15 pt-8">
            {t.about.numbers.map((n) => (
              <div key={n.label}>
                <p className="font-display text-[clamp(2.4rem,4vw,3.6rem)] leading-none">{n.value}</p>
                <p className="mt-2 text-xs leading-snug text-ink-soft">{n.label}</p>
              </div>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 md:px-10">
        {t.about.chapters.map((chapter, i) => {
          const { image, Ink } = chapterArt[i];
          const flip = i % 2 === 1;
          return (
            <article key={chapter.title} className="grid items-center gap-10 border-t border-ink/10 py-20 md:py-28 lg:grid-cols-12">
              <div className={cn("lg:col-span-5", flip && "lg:order-2 lg:col-start-8")}>
                <Parallax speed={0.12}>
                  <div className={cn("aspect-[4/5] overflow-hidden", flip ? "rounded-[2rem]" : "arch")}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </div>
                </Parallax>
              </div>
              <div className={cn("relative lg:col-span-6", flip ? "lg:order-1" : "lg:col-start-7")}>
                <span className="font-display text-8xl leading-none text-gilt/40 italic">{["I", "II", "III", "IV"][i]}</span>
                <Reveal as="h2" className="mt-2 text-huge">
                  {chapter.title}
                </Reveal>
                <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">{chapter.text}</p>
                <DrawOnScroll className="mt-10">
                  <Ink className="w-28 text-cocoa" weight={1.3} />
                </DrawOnScroll>
              </div>
            </article>
          );
        })}
      </section>

      <section className="bg-night py-24 text-paper md:py-32">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10">
          <p className="kicker text-gilt-soft">@sin.chisinau</p>
          <Reveal as="h2" className="mt-6 max-w-3xl text-giant">
            {t.home.filmLead}
          </Reveal>
          <ReelStrip
            className="mt-16 md:mb-16"
            reels={[
              { src: "/media/video/autumn-cinnamon.mp4", smallSrc: "/media/video/autumn-cinnamon-540.mp4", poster: "/media/video/autumn-cinnamon.webp", label: "Cinnamon season" },
              { src: "/media/video/autumn-drinks.mp4", smallSrc: "/media/video/autumn-drinks-540.mp4", poster: "/media/video/autumn-drinks.webp", label: t.home.seasonTitle },
              { src: "/media/video/rainy-day.mp4", smallSrc: "/media/video/rainy-day-540.mp4", poster: "/media/video/rainy-day.webp", label: "Rainy day" },
            ]}
          />
        </div>
      </section>
    </>
  );
}
