"use client";

import { useEffect, useRef, useState } from "react";
import { OnPathname } from "./OnPathname";
import { gsap } from "@/lib/gsap";

/**
 * A halo that trails the pointer. Elements with data-cursor="label" swell it into a
 * reading disc with that label; links and buttons tilt it.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");
    const dx = gsap.quickTo(dot.current, "x", { duration: 0.08, ease: "power3" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.08, ease: "power3" });
    const hx = gsap.quickTo(halo.current, "x", { duration: 0.55, ease: "power3" });
    const hy = gsap.quickTo(halo.current, "y", { duration: 0.55, ease: "power3" });
    let mode = "";
    let seen = false;

    const move = (e: PointerEvent) => {
      if (!seen) {
        seen = true;
        gsap.set([dot.current, halo.current], { x: e.clientX, y: e.clientY });
        gsap.to([dot.current, halo.current], { autoAlpha: 1, duration: 0.3 });
      }
      dx(e.clientX);
      dy(e.clientY);
      hx(e.clientX);
      hy(e.clientY);
      const target = e.target as HTMLElement | null;
      const labelled = target?.closest<HTMLElement>("[data-cursor]");
      const interactive = target?.closest("a, button, [role=button], input, textarea, select, label");
      const next = labelled ? `label:${labelled.dataset.cursor}` : interactive ? "link" : "";
      if (next === mode) return;
      mode = next;
      if (labelled) {
        setLabel(labelled.dataset.cursor ?? "");
        gsap.to(halo.current, { width: 96, height: 96, rotate: 0, borderRadius: "50%", backgroundColor: "var(--color-ink)", borderColor: "transparent", duration: 0.45, ease: "power3.out" });
        gsap.to(dot.current, { scale: 0, duration: 0.2 });
      } else {
        setLabel("");
        gsap.to(halo.current, {
          width: interactive ? 54 : 38,
          height: interactive ? 22 : 14,
          rotate: interactive ? -14 : 0,
          borderRadius: "50%",
          backgroundColor: "transparent",
          borderColor: interactive ? "var(--color-gilt)" : "var(--color-ink)",
          duration: 0.45,
          ease: "power3.out",
        });
        gsap.to(dot.current, { scale: interactive ? 0.4 : 1, duration: 0.2 });
      }
    };
    const leave = () => gsap.to([dot.current, halo.current], { autoAlpha: 0, duration: 0.2 });
    const enter = () => gsap.to([dot.current, halo.current], { autoAlpha: 1, duration: 0.2 });
    const down = () => gsap.to(halo.current, { scale: 0.8, duration: 0.15 });
    const up = () => gsap.to(halo.current, { scale: 1, duration: 0.3, ease: "back.out(3)" });

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    document.addEventListener("pointerenter", enter);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("pointerenter", enter);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, [enabled]);

  return (
    <>
    <OnPathname onChange={(p) => setEnabled(!p.includes("/admin"))} />
    {enabled && (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] hidden [@media(hover:hover)_and_(pointer:fine)]:block">
      <div
        ref={halo}
        className="absolute top-0 left-0 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[50%] border border-ink"
        style={{ width: 38, height: 14, opacity: 0 }}
      >
        <span className="font-mono text-[10px] tracking-[0.2em] text-paper uppercase">{label}</span>
      </div>
      <div ref={dot} className="absolute top-0 left-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cherry" style={{ opacity: 0 }} />
    </div>
    )}
    </>
  );
}
