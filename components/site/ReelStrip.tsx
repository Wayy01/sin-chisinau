"use client";

import { useEffect, useRef } from "react";
import { prefersStill } from "@/components/motion/AutoVideo";
import { cn } from "@/lib/cn";

type Reel = { src: string; smallSrc?: string; poster: string; label: string };

/**
 * Instagram reels as quiet posters. With a pointer they wake on hover; on phones they sit in a
 * swipeable row and only the reel that is mostly on screen plays.
 */
export function ReelStrip({ reels, className }: { reels: Reel[]; className?: string }) {
  const refs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const videos = refs.current.filter((v): v is HTMLVideoElement => !!v);
    if (window.matchMedia("(hover: hover)").matches) {
      videos.forEach((v) => (v.preload = "metadata"));
      return;
    }
    if (prefersStill()) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach(({ target, intersectionRatio }) => {
          const v = target as HTMLVideoElement;
          if (intersectionRatio >= 0.6) {
            v.preload = "auto";
            v.play().catch(() => {});
          } else {
            v.pause();
          }
        }),
      { threshold: [0, 0.6] },
    );
    videos.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0",
        className,
      )}
    >
      {reels.map((reel, i) => (
        <div
          key={reel.src}
          data-cursor="▶"
          className={cn(
            "group relative aspect-[9/16] w-[64vw] max-w-[300px] shrink-0 snap-center overflow-hidden rounded-[1.5rem] bg-paper-2 md:w-auto md:max-w-none",
            i === 1 && "md:translate-y-16",
          )}
          onPointerEnter={(e) => e.pointerType === "mouse" && refs.current[i]?.play().catch(() => {})}
          onPointerLeave={(e) => e.pointerType === "mouse" && refs.current[i]?.pause()}
        >
          <video
            ref={(el) => {
              refs.current[i] = el;
            }}
            poster={reel.poster}
            muted
            loop
            playsInline
            preload="none"
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105 [@media(hover:none)]:pointer-events-none"
          >
            {reel.smallSrc && <source src={reel.smallSrc} media="(max-width: 767px)" type="video/mp4" />}
            <source src={reel.src} type="video/mp4" />
          </video>
          <span className="absolute bottom-4 left-4 max-w-[calc(100%-2rem)] rounded-full bg-paper/90 px-3 py-1 font-mono text-[10px] tracking-[0.15em] text-ink uppercase backdrop-blur">
            {reel.label}
          </span>
        </div>
      ))}
    </div>
  );
}
