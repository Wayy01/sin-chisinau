"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContext,
  use,
  useCallback,
  useRef,
  type ComponentProps,
  type ReactNode,
} from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { Wordmark } from "@/components/art/Wordmark";
import { OnPathname } from "./OnPathname";

const NavContext = createContext<{ navigate: (href: string) => void }>({ navigate: () => {} });

// Same command structure in every frame so GSAP can tween the path data.
const ENTER = {
  from: "M0 100 Q50 100 100 100 L100 100 L0 100 Z",
  mid: "M0 55 Q50 18 100 55 L100 100 L0 100 Z",
  full: "M0 0 Q50 0 100 0 L100 100 L0 100 Z",
};
const LEAVE = {
  from: "M0 0 L100 0 L100 100 Q50 100 0 100 Z",
  mid: "M0 0 L100 0 L100 45 Q50 82 0 45 Z",
  end: "M0 0 L100 0 L100 0 Q50 0 0 0 Z",
};

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const mark = useRef<SVGSVGElement>(null);
  const pending = useRef(false);

  const navigate = useCallback(
    (href: string) => {
      if (pending.current) return;
      if (prefersReducedMotion() || !root.current) {
        router.push(href);
        return;
      }
      pending.current = true;
      const strokes = mark.current?.querySelectorAll("[data-draw]") ?? [];
      gsap
        .timeline()
        .set(root.current, { visibility: "visible" })
        .set(path.current, { attr: { d: ENTER.from } })
        .set(strokes, { drawSVG: "0%" })
        .to(path.current, { attr: { d: ENTER.mid }, duration: 0.42, ease: "power3.in" })
        .to(path.current, { attr: { d: ENTER.full }, duration: 0.3, ease: "power2.out" })
        .to(strokes, { drawSVG: "100%", duration: 0.6, stagger: 0.03, ease: "power2.inOut" }, "-=0.35")
        .add(() => router.push(href), "-=0.25");
    },
    [router],
  );

  const reveal = useCallback(() => {
    if (!pending.current) return;
    gsap
      .timeline({
        delay: 0.1,
        onComplete: () => {
          pending.current = false;
          gsap.set(root.current, { visibility: "hidden" });
        },
      })
      .set(path.current, { attr: { d: LEAVE.from } })
      .to(mark.current, { autoAlpha: 0, y: -20, duration: 0.3, ease: "power2.in" })
      .to(path.current, { attr: { d: LEAVE.mid }, duration: 0.4, ease: "power3.in" }, "<0.05")
      .to(path.current, { attr: { d: LEAVE.end }, duration: 0.35, ease: "power2.out" })
      .set(mark.current, { autoAlpha: 1, y: 0 });
  }, []);

  return (
    <NavContext value={{ navigate }}>
      {children}
      <OnPathname onChange={reveal} />
      <div
        ref={root}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[90] grid place-items-center"
        style={{ visibility: "hidden" }}
      >
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path ref={path} d={ENTER.from} fill="var(--color-night)" />
        </svg>
        <Wordmark ref={mark} className="relative w-40 text-paper md:w-56" />
      </div>
    </NavContext>
  );
}

export function useNavigate() {
  return use(NavContext).navigate;
}

/** Internal link that plays the ink curtain before navigating. */
export function TLink({ href, onClick, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const { navigate } = use(NavContext);
  return (
    <Link
      href={href}
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if (props.target === "_blank") return;
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname) {
          if (url.hash) return;
          if (url.search === window.location.search) {
            e.preventDefault();
            window.__lenis?.scrollTo(0);
            return;
          }
          return;
        }
        e.preventDefault();
        navigate(url.pathname + url.search + url.hash);
      }}
    />
  );
}
