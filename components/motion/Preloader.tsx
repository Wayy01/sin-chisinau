"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Wordmark } from "@/components/art/Wordmark";

declare global {
  interface Window {
    __sinIntroDone?: boolean;
  }
}

export const INTRO_EVENT = "sin:intro-done";

function finish() {
  window.__sinIntroDone = true;
  window.dispatchEvent(new Event(INTRO_EVENT));
}

/** Runs once per browser session: the mark inks itself in, the halo drops, the curtain lifts. */
export function Preloader({ tagline }: { tagline: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      if (document.documentElement.dataset.intro === "seen" || prefersReducedMotion()) {
        el.style.display = "none";
        finish();
        return;
      }
      sessionStorage.setItem("sin_intro", "1");
      window.__lenis?.stop();
      const strokes = el.querySelectorAll("[data-draw]:not([data-halo])");
      const halo = el.querySelector("[data-halo]");
      const counter = { v: 0 };
      const num = el.querySelector("[data-count]")!;

      gsap
        .timeline({
          onComplete: () => {
            el.style.display = "none";
            window.__lenis?.start();
          },
        })
        .set(strokes, { drawSVG: "0%" })
        .set(halo, { drawSVG: "0%", y: -40, opacity: 0 })
        .to(counter, {
          v: 100,
          duration: 1.9,
          ease: "power2.inOut",
          onUpdate: () => {
            num.textContent = String(Math.round(counter.v)).padStart(3, "0");
          },
        })
        .to(strokes, { drawSVG: "100%", duration: 1.3, stagger: 0.09, ease: "power2.inOut" }, 0.1)
        .to(halo, { opacity: 1, y: 0, drawSVG: "100%", duration: 0.9, ease: "back.out(2.2)" }, 1.15)
        .to("[data-tagline]", { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 1.3)
        .to(el.querySelector("[data-inner]"), { y: -40, opacity: 0, duration: 0.5, ease: "power2.in" }, "+=0.25")
        .add(finish, "<0.2")
        .to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "ink" }, "<");
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      data-preloader
      className="fixed inset-0 z-[95] grid place-items-center bg-night text-paper"
      style={{ clipPath: "inset(0 0 0% 0)" }}
    >
      <div data-inner className="flex flex-col items-center gap-6">
        <Wordmark className="w-56 md:w-72" />
        <p data-tagline className="kicker translate-y-3 text-gilt-soft opacity-0">
          {tagline}
        </p>
      </div>
      <span data-count className="absolute right-6 bottom-6 font-mono text-xs tracking-[0.3em] text-paper/60 md:right-10 md:bottom-10">
        000
      </span>
      <span className="absolute bottom-6 left-6 font-mono text-xs tracking-[0.3em] text-paper/40 md:bottom-10 md:left-10">
        CHIȘINĂU · 2025
      </span>
    </div>
  );
}
