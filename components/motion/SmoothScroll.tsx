"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { OnPathname } from "./OnPathname";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (isAdmin !== false || prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95 });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, [isAdmin]);

  const onRoute = useCallback((pathname: string) => {
    setIsAdmin(pathname.includes("/admin"));
    if (window.location.hash) return;
    window.__lenis?.scrollTo(0, { immediate: true, force: true });
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, []);

  return (
    <>
      {children}
      <OnPathname onChange={onRoute} />
    </>
  );
}
