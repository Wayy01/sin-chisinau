"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Wordmark } from "@/components/art/Wordmark";
import { cn } from "@/lib/cn";

type Props = {
  name: string;
  tierName: string;
  halos: number;
  memberCode: string;
  qrSvg: string;
  halosLabel: string;
  flipLabel?: string;
  hint?: string;
  className?: string;
  interactive?: boolean;
};

/**
 * The Sinners Club card: gilt-foil front that tilts toward the pointer, QR on the back.
 * Tap/click flips it.
 */
export function MemberCard({ name, tierName, halos, memberCode, qrSvg, halosLabel, flipLabel, hint, className, interactive = true }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);

  useGSAP(
    () => {
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const el = root.current!;
      const rx = gsap.quickTo(card.current, "rotateX", { duration: 0.6, ease: "power3" });
      const ry = gsap.quickTo(card.current, "rotateY", { duration: 0.6, ease: "power3" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        rx(-py * 14);
        ry(px * 18 + (flipped ? 180 : 0));
        el.style.setProperty("--shine-x", `${(px + 0.5) * 100}%`);
        el.style.setProperty("--shine-y", `${(py + 0.5) * 100}%`);
      };
      const leave = () => {
        rx(0);
        ry(flipped ? 180 : 0);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    },
    { scope: root, dependencies: [flipped] },
  );

  const flip = () => {
    if (!interactive) return;
    const next = !flipped;
    setFlipped(next);
    gsap.to(card.current, { rotateY: next ? 180 : 0, rotateX: 0, duration: 1, ease: "back.out(1.2)" });
  };

  return (
    <div ref={root} className={cn("[perspective:1400px]", className)}>
      <div
        ref={card}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={flipLabel}
        onClick={flip}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), flip())}
        className="relative aspect-[1.586] w-full [transform-style:preserve-3d]"
      >
        {/* front */}
        <div className="absolute inset-0 overflow-hidden rounded-[1.4rem] bg-night p-6 text-paper shadow-[0_40px_80px_-30px_rgba(19,12,8,.65)] [backface-visibility:hidden] md:p-7">
          <div
            className="pointer-events-none absolute inset-0 opacity-70 mix-blend-screen"
            style={{
              background:
                "radial-gradient(120% 90% at var(--shine-x,30%) var(--shine-y,20%), rgba(232,205,150,.35), transparent 55%), conic-gradient(from 120deg at 70% 120%, #3a2416, #1a100b 40%, #4a3020 70%, #1a100b)",
            }}
          />
          <div className="absolute -top-14 -right-10 h-28 w-56 rounded-[50%] border border-gilt/40" />
          <div className="absolute -top-10 -right-4 h-20 w-44 rounded-[50%] border border-gilt/25" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-start justify-between">
              <Wordmark className="w-20 text-gilt-soft md:w-24" />
              <span className="font-mono text-[10px] tracking-[0.25em] text-paper/60 uppercase">Sinners Club</span>
            </div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-display text-2xl leading-none md:text-3xl">{name}</p>
                <p className="mt-2 font-mono text-[10px] tracking-[0.25em] text-gilt-soft uppercase">
                  {tierName} · {memberCode}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-4xl leading-none tabular md:text-5xl">{halos}</p>
                <p className="mt-1 font-mono text-[10px] tracking-[0.2em] text-paper/60 uppercase">{halosLabel}</p>
              </div>
            </div>
          </div>
        </div>
        {/* back */}
        <div className="absolute inset-0 flex items-center gap-5 overflow-hidden rounded-[1.4rem] bg-milk p-5 text-ink shadow-[0_40px_80px_-30px_rgba(19,12,8,.45)] [backface-visibility:hidden] [transform:rotateY(180deg)] md:p-6">
          <div className="aspect-square h-full shrink-0 rounded-xl bg-white p-2" dangerouslySetInnerHTML={{ __html: qrSvg }} />
          <div className="flex min-w-0 flex-col gap-2">
            <Wordmark className="w-14 text-cocoa" />
            <p className="font-mono text-sm tracking-[0.18em]">{memberCode}</p>
            {hint && <p className="text-xs leading-relaxed text-ink-soft">{hint}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
