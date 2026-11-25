"use client";

import { useRef } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n/client";
import { TLink } from "@/components/motion/PageTransition";
import { Reveal } from "@/components/motion/Reveal";
import { Magnetic } from "@/components/motion/Effects";
import { INTRO_EVENT } from "@/components/motion/Preloader";
import { InkArrow, InkCroissant, InkSparkle, PaintWash } from "@/components/art/Ink";
import { OpenStatus } from "@/components/site/OpenStatus";
import { AutoVideo } from "@/components/motion/AutoVideo";

export function Hero({ lead, hours }: { lead: string; hours: string }) {
  const { locale, t } = useI18n();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ paused: true, defaults: { ease: "silk" } });
        tl.from("[data-arch]", { clipPath: "inset(100% 0% 0% 0% round 999px 999px 20px 20px)", duration: 1.6, ease: "ink" }, 0.1)
          .from("[data-arch] video", { scale: 1.35, duration: 2.2 }, 0.1)
          .from("[data-badge]", { scale: 0, rotate: -120, duration: 1.2, ease: "back.out(1.6)" }, 0.9)
          .fromTo("[data-croissant] [data-draw]", { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.8, stagger: 0.07, ease: "power2.inOut" }, 0.4)
          .from("[data-fade]", { y: 24, opacity: 0, duration: 1, stagger: 0.08 }, 0.9)
          .fromTo("[data-note] [data-draw]", { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.9, ease: "power2.out" }, 1.4)
          .from("[data-wash]", { scale: 0.6, opacity: 0, duration: 2 }, 0.2);

        const play = () => tl.play();
        if (window.__sinIntroDone) play();
        else window.addEventListener(INTRO_EVENT, play, { once: true });

        gsap.to("[data-arch]", {
          yPercent: 12,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to("[data-headline]", {
          yPercent: -18,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        return () => window.removeEventListener(INTRO_EVENT, play);
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative isolate overflow-hidden pt-28 md:pt-36">
      <div data-wash className="pointer-events-none absolute -top-40 -right-40 -z-10 w-[70vw] max-w-[900px] text-gilt-soft opacity-60">
        <PaintWash className="w-full" />
      </div>

      <div className="mx-auto grid max-w-[1600px] gap-10 px-5 md:px-10 lg:grid-cols-12 lg:gap-6">
        <div data-headline className="relative lg:col-span-7 lg:pt-10">
          <p data-fade className="kicker text-ink-soft">
            {t.home.eyebrow}
          </p>

          <h1 className="mt-8 font-display text-[clamp(4.2rem,12.5vw,12.5rem)] leading-[0.82] tracking-[-0.035em]">
            <Reveal as="span" on="intro" by="chars" className="block">
              {t.home.heroA}
            </Reveal>
            <Reveal as="span" on="intro" by="chars" delay={0.15} className="block pl-[0.6em] italic text-cocoa">
              {t.home.heroB}
            </Reveal>
            <Reveal as="span" on="intro" delay={0.35} className="mt-3 block text-[0.42em] leading-[0.95] tracking-[-0.02em]">
              {t.home.heroC}
            </Reveal>
          </h1>

          <div data-croissant className="pointer-events-none absolute top-[46%] right-[4%] hidden w-44 text-gilt xl:block">
            <InkCroissant weight={1.3} className="w-full -rotate-12" />
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-[1fr_auto] md:items-end lg:mt-16">
            <p data-fade className="max-w-md text-[1.05rem] leading-relaxed text-ink-soft">
              {lead || t.home.heroLead}
            </p>
            <div data-fade className="grid gap-3 sm:flex sm:flex-wrap">
              <Magnetic className="sm:inline-block">
                <TLink href={`/${locale}/menu`} className="btn btn-lg w-full sm:w-auto" data-cursor="→">
                  {t.home.ctaMenu}
                  <ArrowRight size={16} />
                </TLink>
              </Magnetic>
              <Magnetic className="sm:inline-block">
                <TLink href={`/${locale}/club`} className="btn btn-line btn-lg w-full sm:w-auto">
                  {t.home.ctaClub}
                </TLink>
              </Magnetic>
            </div>
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <div className="relative mx-auto w-[78%] max-w-[460px] sm:w-[60%] lg:w-full">
            <div data-arch className="arch relative aspect-[3/4.4] overflow-hidden bg-paper-2" data-cursor="SIN">
              <AutoVideo
                className="absolute inset-0 h-full w-full object-cover"
                src="/media/video/autumn-cinnamon.mp4"
                smallSrc="/media/video/autumn-cinnamon-540.mp4"
                poster="/media/video/autumn-cinnamon.webp"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night/35 via-transparent to-transparent" />
            </div>

            <div data-badge className="absolute -bottom-8 -left-6 size-32 sm:-left-10 sm:size-36 md:-left-16 md:size-44">
              <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full animate-spin-slow text-ink">
                <defs>
                  <path id="badge-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
                </defs>
                <text className="font-mono text-[12.5px] uppercase" fill="currentColor">
                  <textPath href="#badge-circle" textLength="486" lengthAdjust="spacing">Signature pastry · Specialty coffee · Chișinău ·</textPath>
                </text>
              </svg>
              <div className="absolute inset-[30%] grid place-items-center rounded-full bg-cherry text-milk">
                <InkSparkle className="w-6" weight={1.2} />
              </div>
            </div>

            <div data-note className="absolute top-[18%] -left-6 hidden -translate-x-full items-end gap-1 text-ink-soft lg:flex">
              <span data-fade className="script -rotate-6 text-2xl whitespace-nowrap">
                {t.home.heroNote}
              </span>
              <InkArrow className="w-20 translate-y-3 rotate-[8deg]" weight={1.2} />
            </div>
          </div>
        </div>
      </div>

      <div data-fade className="mx-auto mt-24 flex max-w-[1600px] items-center justify-between px-5 pb-8 md:px-10">
        <OpenStatus hours={hours} className="text-ink-soft" />
        <span className="flex items-center gap-3 font-mono text-[11px] tracking-[0.2em] text-ink-soft uppercase">
          {t.common.scroll}
          <span className="relative block h-10 w-px overflow-hidden bg-ink/15">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2s_ease-in-out_infinite] bg-ink" />
          </span>
        </span>
      </div>
    </section>
  );
}
