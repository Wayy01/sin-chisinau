"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Inks every [data-draw] stroke inside when the block scrolls into view (or scrubs with scroll). */
export function DrawOnScroll({
  children,
  className,
  scrub = false,
  start = "top 80%",
  duration = 1.6,
}: {
  children: ReactNode;
  className?: string;
  scrub?: boolean;
  start?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const strokes = ref.current!.querySelectorAll("[data-draw]");
      if (!strokes.length) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          strokes,
          { drawSVG: "0%" },
          {
            drawSVG: "100%",
            duration,
            ease: "power2.inOut",
            stagger: 0.08,
            scrollTrigger: scrub
              ? { trigger: ref.current, start, end: "bottom 40%", scrub: 1 }
              : { trigger: ref.current, start, once: true },
          },
        );
      });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Subtle vertical drift tied to scroll. speed > 0 moves slower than the page. */
export function Parallax({
  children,
  className,
  speed = 0.15,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ref.current,
          { yPercent: -speed * 50 },
          {
            yPercent: speed * 50,
            ease: "none",
            scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Pulls its child toward the pointer. */
export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = ref.current!;
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const x = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      const y = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        x((e.clientX - (r.left + r.width / 2)) * strength);
        y((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const reset = () => {
        x(0);
        y(0);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", reset);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", reset);
      };
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={className ?? "inline-block"}>
      {children}
    </div>
  );
}

/** Counts up to `value` when visible. */
export function Counter({ value, className, duration = 1.6 }: { value: number; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      const el = ref.current!;
      const state = { v: 0 };
      gsap.to(state, {
        v: value,
        duration,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 95%", once: true },
        onUpdate: () => {
          el.textContent = Math.round(state.v).toLocaleString("ro-MD");
        },
      });
    },
    { scope: ref, dependencies: [value] },
  );
  return (
    <span ref={ref} className={className}>
      {value.toLocaleString("ro-MD")}
    </span>
  );
}

/** Fades and lifts children in sequence as they enter. */
export function Stagger({ children, className, selector = ":scope > *" }: { children: ReactNode; className?: string; selector?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = ref.current!.querySelectorAll(selector);
        gsap.from(items, {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: "silk",
          stagger: 0.08,
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
        });
      });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
