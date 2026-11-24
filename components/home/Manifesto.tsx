"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { InkWheat, BrushStroke } from "@/components/art/Ink";

/** Words soak in from pale to full ink as you read down. */
export function Manifesto({ kicker, text, sign }: { kicker: string; text: string; sign: string }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(root.current!.querySelector("[data-text]")!, { type: "words" });
        gsap.fromTo(
          split.words,
          { opacity: 0.12 },
          {
            opacity: 1,
            stagger: 0.1,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top 70%", end: "bottom 65%", scrub: true },
          },
        );
        gsap.fromTo(
          root.current!.querySelectorAll("[data-draw]"),
          { drawSVG: "0%" },
          {
            drawSVG: "100%",
            ease: "none",
            stagger: 0.02,
            scrollTrigger: { trigger: root.current, start: "top 75%", end: "bottom 60%", scrub: true },
          },
        );
        gsap.from("[data-brush]", {
          scaleX: 0,
          transformOrigin: "0% 50%",
          ease: "power2.out",
          scrollTrigger: { trigger: root.current, start: "center 60%", end: "bottom 60%", scrub: true },
        });
        return () => split.revert();
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden px-5 py-32 md:px-10 md:py-48">
      <InkWheat className="pointer-events-none absolute top-24 left-[3%] hidden w-24 -rotate-12 text-gilt md:block" weight={1.2} />
      <InkWheat className="pointer-events-none absolute right-[4%] bottom-24 hidden w-20 rotate-[18deg] text-gilt md:block" weight={1.2} />

      <div className="mx-auto max-w-[1180px] text-center">
        <p className="kicker text-gilt">{kicker}</p>
        <p data-text className="mt-10 font-display text-[clamp(2.1rem,4.6vw,4.4rem)] leading-[1.06] tracking-[-0.02em]">
          {text}
        </p>
        <div className="relative mx-auto mt-12 inline-block">
          <BrushStroke data-brush className="absolute -inset-x-6 inset-y-1 h-[85%] w-[calc(100%+3rem)] text-gilt-soft/70" />
          <span className="script relative text-3xl text-cocoa md:text-4xl">{sign}</span>
        </div>
      </div>
    </section>
  );
}
