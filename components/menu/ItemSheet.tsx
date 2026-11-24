"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "@phosphor-icons/react";
import { gsap } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n/client";
import { plural } from "@/lib/i18n/config";
import { ProductVisual } from "@/components/site/ProductVisual";
import { HaloGlyph } from "@/components/art/Wordmark";
import { BrushStroke } from "@/components/art/Ink";
import { FavoriteButton } from "./FavoriteButton";
import type { MenuEntry } from "./MenuBrowser";

/** Side sheet on desktop, bottom sheet on phones. Keeps the last item mounted while it animates out. */
export function ItemSheet({ item, onClose }: { item: MenuEntry | null; onClose: () => void }) {
  const { locale, t } = useI18n();
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<MenuEntry | null>(item);
  if (item && item !== shown) setShown(item);

  useEffect(() => {
    const el = root.current!;
    const mobile = window.innerWidth < 768;
    if (item) {
      window.__lenis?.stop();
      gsap.set(el, { visibility: "visible" });
      gsap.to("[data-scrim]", { opacity: 1, duration: 0.4 });
      gsap.fromTo(
        panel.current,
        mobile ? { yPercent: 100 } : { xPercent: 100 },
        { yPercent: 0, xPercent: 0, duration: 0.8, ease: "ink" },
      );
      gsap.from("[data-sheet-in]", { y: 24, opacity: 0, stagger: 0.06, duration: 0.7, delay: 0.3, ease: "silk" });
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
      window.addEventListener("keydown", onKey);
      panel.current?.focus();
      return () => window.removeEventListener("keydown", onKey);
    }
    if (el.style.visibility === "visible") {
      window.__lenis?.start();
      gsap.to("[data-scrim]", { opacity: 0, duration: 0.4 });
      gsap.to(panel.current, {
        ...(mobile ? { yPercent: 100 } : { xPercent: 100 }),
        duration: 0.55,
        ease: "power3.in",
        onComplete: () => gsap.set(el, { visibility: "hidden" }),
      });
    }
  }, [item, onClose]);

  const halos = shown ? Math.floor(shown.price / 10) : 0;

  return (
    <div ref={root} className="fixed inset-0 z-[70]" style={{ visibility: "hidden" }} role="dialog" aria-modal aria-label={shown?.name}>
      <div data-scrim onClick={onClose} className="absolute inset-0 bg-night/50 opacity-0 backdrop-blur-[2px]" />
      <div
        ref={panel}
        tabIndex={-1}
        data-lenis-prevent
        className="absolute inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-[2rem] bg-paper outline-none md:inset-y-3 md:right-3 md:left-auto md:max-h-none md:w-[min(560px,46vw)] md:rounded-[2rem]"
      >
        {shown && (
          <>
            <div className="relative aspect-[4/3.4] overflow-hidden md:aspect-[4/4.2]">
              <ProductVisual image={shown.image} alt={shown.name} categorySlug={shown.categorySlug} />
              <button
                type="button"
                onClick={onClose}
                aria-label={t.nav.close}
                className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-paper/90 text-ink backdrop-blur transition-transform hover:rotate-90"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-7 md:p-9">
              <div data-sheet-in className="flex items-start justify-between gap-4">
                <h3 className="font-display text-[2.6rem] leading-[0.98]">{shown.name}</h3>
                <FavoriteButton itemId={shown.id} />
              </div>
              <p data-sheet-in className="mt-4 leading-relaxed text-ink-soft">{shown.desc}</p>
              <div data-sheet-in className="mt-8 flex items-center justify-between border-y border-ink/10 py-5">
                <span className="relative px-4 py-1.5 text-milk">
                  <BrushStroke className="absolute inset-0 h-full w-full text-cherry" />
                  <span className="relative font-mono text-lg tabular">
                    {shown.price} {t.common.lei}
                  </span>
                </span>
                {shown.portion && (
                  <span className="font-mono text-xs tracking-[0.15em] text-ink-soft uppercase">
                    {t.menu.portion} · {shown.portion}
                  </span>
                )}
              </div>
              <div data-sheet-in className="mt-6 flex items-center gap-4 rounded-2xl bg-night p-5 text-paper">
                <HaloGlyph className="w-12 shrink-0 text-gilt" />
                <p className="text-sm leading-snug text-paper/80">
                  {t.menu.earn}{" "}
                  <span className="font-display text-2xl text-gilt">
                    {halos} {plural(locale, halos, t.common.halos)}
                  </span>{" "}
                  · Sinners Club
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
