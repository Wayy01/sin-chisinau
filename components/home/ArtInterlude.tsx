"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Raphael's putti, gazing at the vitrine — we ink fresh halos over their heads as you pass. */
export function ArtInterlude({ note }: { note: string }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-painting]",
          { yPercent: -8, scale: 1.12 },
          {
            yPercent: 8,
            scale: 1.02,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
        gsap.fromTo(
          "[data-halo]",
          { drawSVG: "0%", opacity: 0 },
          {
            drawSVG: "100%",
            opacity: 1,
            duration: 1.4,
            stagger: 0.35,
            ease: "power2.inOut",
            scrollTrigger: { trigger: root.current, start: "top 55%", once: true },
          },
        );
        gsap.from("[data-caption]", {
          y: 30,
          opacity: 0,
          duration: 1,
          ease: "silk",
          scrollTrigger: { trigger: "[data-caption]", start: "top 90%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="px-3 py-16 md:px-6 md:py-24">
      <figure className="relative mx-auto max-w-[1240px]">
        <div className="paper-edge relative aspect-[1108/768] overflow-hidden bg-paper-2">
          <div data-painting className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/media/art/putti.webp" alt="Raffaello Sanzio, putti din Madona Sixtină (1512)" className="h-full w-full object-cover" loading="lazy" />
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
              <g fill="none" stroke="#efd79c" strokeWidth="0.35" style={{ filter: "drop-shadow(0 0 6px rgba(240,210,140,.95))" }}>
                <ellipse data-halo cx="30" cy="33" rx="8" ry="2.3" transform="rotate(-6 30 33)" />
                <ellipse data-halo cx="72" cy="49" rx="7.6" ry="2.2" transform="rotate(5 72 49)" />
              </g>
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-night/40 via-transparent to-transparent" />
        </div>
        <figcaption data-caption className="mt-6 flex flex-col justify-between gap-3 px-2 md:flex-row md:items-end">
          <p className="script max-w-xl text-[1.7rem] leading-snug text-cocoa md:text-3xl">{note}</p>
          <p className="font-mono text-[10px] tracking-[0.2em] text-ink-soft uppercase">Raffaello Sanzio · Madonna Sistina, 1512 · detail</p>
        </figcaption>
      </figure>
    </section>
  );
}
