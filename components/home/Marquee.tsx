"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { HaloGlyph } from "@/components/art/Wordmark";
import { cn } from "@/lib/cn";

/** Endless ribbon of pastry names; scroll speed pushes it faster and leans it into the motion. */
export function Marquee({ items, className, reverse = false }: { items: string[]; className?: string; reverse?: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = root.current!.querySelector("[data-track]")!;
      const loop = gsap.fromTo(
        track,
        { xPercent: reverse ? -50 : 0 },
        { xPercent: reverse ? 0 : -50, duration: 38, ease: "none", repeat: -1 },
      );
      const skew = gsap.quickTo(track, "skewX", { duration: 0.5, ease: "power3" });
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const v = self.getVelocity();
          loop.timeScale(1 + Math.min(Math.abs(v) / 300, 5));
          skew(gsap.utils.clamp(-8, 8, v / -200));
          gsap.to(loop, { timeScale: 1, duration: 1.2, overwrite: true, delay: 0.1 });
        },
      });
      return () => st.kill();
    },
    { scope: root },
  );

  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((item) => (
        <span key={item} className="flex items-center">
          <span className="px-8 font-display text-[clamp(2.4rem,5vw,4.6rem)] leading-none italic whitespace-nowrap">{item}</span>
          <HaloGlyph className="w-12 text-gilt" />
        </span>
      ))}
    </div>
  );

  return (
    <div ref={root} className={cn("overflow-hidden py-8", className)} aria-label={items.join(", ")}>
      <div data-track className="flex w-max will-change-transform" aria-hidden>
        {row}
        {row}
      </div>
    </div>
  );
}
