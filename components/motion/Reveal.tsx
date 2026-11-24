"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { INTRO_EVENT } from "./Preloader";

type Props = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number;
  /** "scroll" reveals when it enters the viewport; "intro" waits for the preloader. */
  on?: "scroll" | "intro";
  by?: "lines" | "words" | "chars";
};

/** Headline reveal: text rises line by line out of a mask, like ink soaking through paper. */
export function Reveal({ as: Tag = "div", children, className, delay = 0, on = "scroll", by = "lines" }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current!;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let tween: gsap.core.Tween | undefined;
        const split = SplitText.create(el, {
          type: by === "lines" ? "lines" : `lines,${by}`,
          mask: "lines",
          autoSplit: true,
          onSplit(self) {
            const targets = by === "lines" ? self.lines : by === "words" ? self.words : self.chars;
            tween?.kill();
            tween = gsap.from(targets, {
              yPercent: 115,
              rotate: by === "chars" ? 8 : 2.5,
              transformOrigin: "0% 100%",
              duration: by === "chars" ? 0.9 : 1.15,
              ease: "silk",
              stagger: by === "chars" ? 0.025 : 0.085,
              delay,
              paused: on === "intro",
              scrollTrigger: on === "scroll" ? { trigger: el, start: "top 88%", once: true } : undefined,
            });
            if (on === "intro") {
              const play = () => tween?.play();
              if (window.__sinIntroDone) play();
              else window.addEventListener(INTRO_EVENT, play, { once: true });
            }
            return tween;
          },
        });
        gsap.set(el, { visibility: "visible" });
        return () => split.revert();
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
