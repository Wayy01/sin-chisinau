"use client";

import { useEffect, useRef, type VideoHTMLAttributes } from "react";

type Props = Omit<VideoHTMLAttributes<HTMLVideoElement>, "src" | "autoPlay" | "preload"> & {
  src: string;
  /** Lighter encode for phones, where the frame is never wide enough to need the full file. */
  smallSrc?: string;
};

/** Reduced-motion and data-saver visitors keep the still poster instead of a looping video. */
export function prefersStill() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || !!connection?.saveData;
}

/**
 * Muted ambient loop that only downloads and plays while it is on (or about to be on) screen,
 * so a phone never decodes footage nobody is looking at.
 */
export function AutoVideo({ src, smallSrc, ...props }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current!;
    if (prefersStill()) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.preload = "auto";
          // Low-power mode and autoplay policies can refuse; the poster stays, which is fine.
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "25% 0px" },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <video ref={ref} muted loop playsInline preload="none" {...props}>
      {smallSrc && <source src={smallSrc} media="(max-width: 767px)" type="video/mp4" />}
      <source src={src} type="video/mp4" />
    </video>
  );
}
