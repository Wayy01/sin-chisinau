"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/** Instagram reels as quiet posters that wake up under the pointer (and autoplay on touch screens). */
export function ReelStrip({ reels, className }: { reels: { src: string; poster: string; label: string }[]; className?: string }) {
  const refs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) refs.current.forEach((v) => v?.play());
  }, []);

  return (
    <div className={cn("grid grid-cols-3 gap-3 md:gap-5", className)}>
      {reels.map((reel, i) => (
        <div
          key={reel.src}
          data-cursor="▶"
          className={cn("group relative aspect-[9/16] overflow-hidden rounded-[1.5rem] bg-paper-2", i === 1 && "md:translate-y-16")}
          onPointerEnter={() => refs.current[i]?.play()}
          onPointerLeave={() => refs.current[i]?.pause()}
        >
          <video
            ref={(el) => {
              refs.current[i] = el;
            }}
            src={reel.src}
            poster={reel.poster}
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105 [@media(hover:none)]:pointer-events-none"
          />
          <span className="absolute bottom-4 left-4 rounded-full bg-paper/90 px-3 py-1 font-mono text-[10px] tracking-[0.15em] text-ink uppercase backdrop-blur">
            {reel.label}
          </span>
        </div>
      ))}
    </div>
  );
}
