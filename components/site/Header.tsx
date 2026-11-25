"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { List, X } from "@phosphor-icons/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n/client";
import { TLink } from "@/components/motion/PageTransition";
import { Wordmark } from "@/components/art/Wordmark";
import { LocaleSwitch } from "./LocaleSwitch";
import { OnPathname, WithPathname } from "@/components/motion/OnPathname";
import { prefersStill } from "@/components/motion/AutoVideo";
import { cn } from "@/lib/cn";

const ROMAN = ["I", "II", "III", "IV", "V"];

export function Header({ account, announcement }: { account: ReactNode; announcement?: string }) {
  const { locale, t } = useI18n();
  const bar = useRef<HTMLElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const film = useRef<HTMLVideoElement>(null);
  const motion = useRef<gsap.core.Timeline | null>(null);
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const closeMenu = useCallback(() => setOpen(false), []);

  const links = [
    { href: `/${locale}/menu`, label: t.nav.menu },
    { href: `/${locale}/club`, label: t.nav.club },
    { href: `/${locale}/journal`, label: t.nav.journal },
    { href: `/${locale}/about`, label: t.nav.about },
    { href: `/${locale}/visit`, label: t.nav.visit },
  ];

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      if (!bar.current || open) return;
      const hide = y > last && y > 160;
      gsap.to(bar.current, { yPercent: hide ? -110 : 0, duration: 0.5, ease: "power3.out", overwrite: true });
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);


  useGSAP(
    () => {
      const el = overlay.current!;
      // Explicit end values: reopening mid-animation must not capture a half-finished state.
      motion.current?.kill();
      if (open) {
        window.__lenis?.stop();
        if (!prefersStill()) film.current?.play().catch(() => {});
        motion.current = gsap
          .timeline()
          .set(el, { visibility: "visible" })
          .fromTo(el, { clipPath: "circle(0% at 92% 4%)" }, { clipPath: "circle(150% at 92% 4%)", duration: 0.9, ease: "ink" })
          .fromTo(el.querySelectorAll("[data-item]"), { yPercent: 130 }, { yPercent: 0, duration: 0.9, stagger: 0.06, ease: "silk" }, "-=0.55")
          .fromTo(el.querySelectorAll("[data-fade]"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.05 }, "-=0.6");
      } else if (el.style.visibility === "visible") {
        window.__lenis?.start();
        motion.current = gsap.timeline().to(el, {
          clipPath: "circle(0% at 92% 4%)",
          duration: 0.6,
          ease: "power3.inOut",
          onComplete: () => {
            gsap.set(el, { visibility: "hidden" });
            film.current?.pause();
          },
        });
      }
    },
    { dependencies: [open] },
  );

  return (
    <>
      <header
        ref={bar}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
          open
            ? "border-b border-transparent text-paper"
            : solid
              ? "border-b border-ink/10 bg-paper/80 backdrop-blur-xl"
              : "border-b border-transparent",
        )}
      >
        {announcement && !solid && !open && (
          <div className="hidden border-b border-ink/10 py-1.5 text-center font-mono text-[11px] tracking-[0.18em] text-ink-soft uppercase md:block">
            <span className="mr-3 inline-block size-1.5 -translate-y-px rounded-full bg-cherry align-middle" />
            {announcement}
          </div>
        )}
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-6 px-5 md:h-[72px] md:px-10">
          <TLink href={`/${locale}`} aria-label="SIN" className={cn("shrink-0 transition-colors", open ? "text-paper" : "text-ink hover:text-cocoa")}>
            <Wordmark className="h-9 w-auto md:h-10" />
          </TLink>

          <nav className="mx-auto hidden items-center gap-1 lg:flex" aria-label="Main">
            <WithPathname>
            {(pathname) => links.map((link, i) => {
              const active = pathname.startsWith(link.href);
              return (
                <TLink
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group relative rounded-full px-4 py-2 text-[0.92rem] transition-colors",
                    active ? "text-ink" : "text-ink-soft hover:text-ink",
                  )}
                >
                  <sup className="mr-1 font-mono text-[9px] tracking-widest text-gilt">{ROMAN[i]}</sup>
                  {link.label}
                  <span
                    className={cn(
                      "absolute inset-x-3 -bottom-0.5 mx-auto h-[5px] rounded-[50%] border border-gilt transition-all duration-500",
                      active ? "scale-100 opacity-100" : "scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100",
                    )}
                  />
                </TLink>
              );
            })}
            </WithPathname>
          </nav>

          <div className="ml-auto flex items-center gap-2 md:gap-4 lg:ml-0">
            <LocaleSwitch className="hidden sm:flex" />
            {/* On the dark menu overlay the ink "Join" pill would vanish, so it turns paper-coloured. */}
            <div className={cn(open && "[&_.btn]:[--btn-bg:var(--color-paper)] [&_.btn]:[--btn-text:var(--color-ink)]")}>{account}</div>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className={cn("relative z-[60] grid size-11 place-items-center rounded-full border lg:hidden", open ? "border-paper/30" : "border-ink/15")}
              aria-expanded={open}
              aria-label={open ? t.nav.close : t.nav.open}
            >
              {open ? <X size={18} /> : <List size={18} />}
            </button>
          </div>
        </div>
      </header>

      <OnPathname onChange={closeMenu} />
      <div
        ref={overlay}
        className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-night px-6 pt-28 pb-10 text-paper lg:hidden"
        style={{ visibility: "hidden" }}
      >
        <nav className="flex flex-col gap-2" aria-label="Mobile">
          {links.map((link, i) => (
            <div key={link.href} className="-mb-[0.22em] overflow-hidden pb-[0.22em] font-display text-[clamp(2.6rem,11vw,4.5rem)] leading-[1.02]">
              <TLink href={link.href} data-item className="flex items-baseline gap-4">
                <span className="w-8 shrink-0 font-mono text-xs text-gilt">{ROMAN[i]}</span>
                {link.label}
              </TLink>
            </div>
          ))}
        </nav>
        <div className="mt-auto flex items-end justify-between gap-6">
          <video
            ref={film}
            data-fade
            className="arch h-44 w-28 object-cover"
            src="/media/video/autumn-cinnamon-540.mp4"
            poster="/media/video/autumn-cinnamon.webp"
            muted
            loop
            playsInline
            preload="none"
          />
          <div data-fade className="flex flex-col items-end gap-4 text-right">
            <LocaleSwitch tone="dark" />
            <p className="font-mono text-[11px] leading-relaxed tracking-[0.15em] text-paper/60 uppercase">
              08:00–21:00
              <br />
              str. 31 August 1989, 113
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
