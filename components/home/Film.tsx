"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { AutoVideo } from "@/components/motion/AutoVideo";

/** A small arch of film that opens into the whole screen as you scroll through it. */
export function Film({
  kicker,
  title,
  lead,
  src,
  poster,
}: {
  kicker: string;
  title: string;
  lead: string;
  src: string;
  poster: string;
}) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const small = window.innerWidth < 768;
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: "+=140%", pin: true, scrub: 0.6 },
        });
        tl.fromTo(
          "[data-frame]",
          {
            clipPath: small
              ? "inset(22% 14% 22% 14% round 999px 999px 24px 24px)"
              : "inset(14% 36% 14% 36% round 999px 999px 24px 24px)",
          },
          { clipPath: "inset(0% 0% 0% 0% round 0px 0px 0px 0px)", ease: "power2.inOut", duration: 1 },
        )
          .fromTo("[data-frame] video", { scale: 1.3 }, { scale: 1, ease: "power2.inOut", duration: 1 }, 0)
          .fromTo("[data-side]", { opacity: 1 }, { opacity: 0, duration: 0.3 }, 0)
          .fromTo("[data-copy]", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.4 }, 0.6);
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative h-dvh overflow-hidden bg-paper">
      <div data-side className="absolute inset-x-0 top-[8%] z-10 flex justify-between px-5 font-mono text-[11px] tracking-[0.2em] text-ink-soft uppercase md:px-10">
        <span>{kicker}</span>
        <span>Rainy day · SIN</span>
      </div>
      <div data-frame className="absolute inset-0 overflow-hidden" style={{ clipPath: "inset(0% 0% 0% 0%)" }}>
        <AutoVideo className="h-full w-full object-cover" src={src} poster={poster} />
        <div className="absolute inset-0 bg-gradient-to-t from-night/75 via-night/10 to-transparent" />
        <div data-copy className="absolute inset-x-0 bottom-0 px-5 pb-14 text-paper md:px-10 md:pb-20">
          <div className="mx-auto max-w-[1600px]">
            <p className="kicker text-gilt-soft">{kicker}</p>
            <h2 className="mt-5 max-w-4xl text-huge">{title}</h2>
            <p className="mt-5 max-w-md text-paper/75">{lead}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
