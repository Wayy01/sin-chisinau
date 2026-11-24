"use client";

import { useRef } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n/client";
import { TLink } from "@/components/motion/PageTransition";
import { Reveal } from "@/components/motion/Reveal";
import { ProductVisual } from "@/components/site/ProductVisual";
import { BrushStroke } from "@/components/art/Ink";
import { cn } from "@/lib/cn";

export type ShowcaseItem = {
  slug: string;
  name: string;
  desc: string;
  price: number;
  image: string | null;
  portion: string | null;
  tags: string[];
  categorySlug: string;
};

export function Confessions({ items }: { items: ShowcaseItem[] }) {
  const { locale, t } = useI18n();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const track = root.current!.querySelector<HTMLElement>("[data-track]")!;
        const distance = () => track.scrollWidth - window.innerWidth;
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
        gsap.utils.toArray<HTMLElement>("[data-card]").forEach((card, i) => {
          gsap.fromTo(
            card.querySelector("[data-visual]"),
            { rotate: i % 2 ? 3 : -3, y: 40 },
            {
              rotate: 0,
              y: 0,
              ease: "none",
              scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "center center", scrub: true },
            },
          );
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-paper py-20 lg:flex lg:h-dvh lg:items-center lg:py-0">
      <div data-track className="flex w-max gap-6 px-5 md:gap-10 md:px-10 max-lg:w-full max-lg:snap-x max-lg:snap-mandatory max-lg:overflow-x-auto max-lg:no-scrollbar">
        <div className="flex w-[82vw] shrink-0 snap-start flex-col justify-center sm:w-[60vw] lg:w-[36vw] lg:pr-10">
          <p className="kicker text-gilt">{t.home.confessionsKicker}</p>
          <Reveal as="h2" className="mt-6 text-[clamp(3rem,5.4vw,5.6rem)] leading-[0.95]">
            {t.home.confessionsTitle}
          </Reveal>
          <p className="mt-8 max-w-sm leading-relaxed text-ink-soft">{t.home.confessionsLead}</p>
          <p className="script mt-10 hidden -rotate-3 text-3xl text-cocoa lg:block">← →</p>
        </div>

        {items.map((item, i) => (
          <TLink
            key={item.slug}
            href={`/${locale}/menu#${item.slug}`}
            data-card
            data-cursor={t.common.readMore}
            className="group flex w-[72vw] shrink-0 snap-start flex-col sm:w-[44vw] lg:w-[24vw] lg:min-w-[300px]"
          >
            <div className="mb-4 flex items-center justify-between font-mono text-[11px] tracking-[0.2em] text-ink-soft uppercase">
              <span>№ {String(i + 1).padStart(2, "0")}</span>
              {item.tags[0] && (
                <span className="rounded-full border border-ink/15 px-2.5 py-1">{t.common[item.tags[0] as "new"] ?? item.tags[0]}</span>
              )}
            </div>
            <div data-visual className={cn("relative aspect-[4/5] overflow-hidden", i % 2 === 0 ? "arch" : "rounded-[1.75rem]")}>
              <ProductVisual
                image={item.image}
                alt={item.name}
                categorySlug={item.categorySlug}
                className="transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
              />
              <span className="absolute top-5 left-1/2 h-4 w-20 -translate-x-1/2 rounded-[50%] border-[1.5px] border-gilt-soft opacity-0 shadow-[0_0_24px_rgba(220,195,148,.7)] transition-all duration-700 group-hover:-translate-y-1 group-hover:opacity-100" />
            </div>
            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-[1.9rem] leading-[1.02]">{item.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">{item.desc}</p>
              </div>
              <span className="relative shrink-0 px-3 py-1 text-milk">
                <BrushStroke className="absolute inset-0 h-full w-full text-cherry" />
                <span className="relative font-mono text-sm tabular">
                  {item.price} {t.common.lei}
                </span>
              </span>
            </div>
          </TLink>
        ))}

        <TLink
          href={`/${locale}/menu`}
          className="group grid w-[60vw] shrink-0 snap-start place-items-center sm:w-[36vw] lg:w-[22vw]"
          data-cursor="→"
        >
          <span className="grid aspect-square w-full max-w-[280px] place-items-center rounded-full border border-ink/20 transition-colors duration-500 group-hover:bg-ink group-hover:text-paper">
            <span className="flex flex-col items-center gap-3 text-center font-display text-3xl italic">
              {t.common.viewAll}
              <ArrowUpRight size={28} weight="light" className="transition-transform duration-500 group-hover:rotate-45" />
            </span>
          </span>
        </TLink>
      </div>
    </section>
  );
}
