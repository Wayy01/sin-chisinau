import { InstagramLogo, ThreadsLogo, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { getT } from "@/lib/i18n/server";
import { getSettings } from "@/lib/data";
import { TLink } from "@/components/motion/PageTransition";
import { DrawOnScroll } from "@/components/motion/Effects";
import { Wordmark } from "@/components/art/Wordmark";
import { InkPaw, Ornament } from "@/components/art/Ink";
import { LocaleSwitch } from "./LocaleSwitch";

export async function Footer() {
  const [{ locale, t }, settings] = await Promise.all([getT(), getSettings()]);
  const nav = [
    { href: `/${locale}/menu`, label: t.nav.menu },
    { href: `/${locale}/club`, label: t.nav.club },
    { href: `/${locale}/journal`, label: t.nav.journal },
    { href: `/${locale}/about`, label: t.nav.about },
    { href: `/${locale}/visit`, label: t.nav.visit },
  ];

  return (
    <footer className="relative overflow-hidden bg-night text-paper">
      <div className="mx-auto max-w-[1600px] px-5 pt-24 md:px-10 md:pt-32">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="kicker text-gilt-soft">{t.footer.tagline}</p>
            <p className="mt-6 max-w-md font-display text-[clamp(2rem,3.4vw,3.1rem)] leading-[1.02] italic">
              {t.home.visitTitle}
            </p>
            <a
              href={settings.instagram}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 text-paper/70 transition-colors hover:text-gilt"
            >
              <InstagramLogo size={18} weight="light" /> @sin.chisinau
              <ArrowUpRight size={14} />
            </a>
          </div>

          <div className="md:col-span-2">
            <p className="kicker text-paper/40">{t.footer.explore}</p>
            <ul className="mt-6 space-y-2.5">
              {nav.map((l) => (
                <li key={l.href}>
                  <TLink href={l.href} className="ink-underline text-paper/80 hover:text-paper">
                    {l.label}
                  </TLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="kicker text-paper/40">{t.footer.contact}</p>
            <address className="mt-6 space-y-2.5 text-paper/80 not-italic">
              <a href={settings.mapsUrl} target="_blank" rel="noreferrer" className="ink-underline block hover:text-paper">
                {settings.address}
              </a>
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="ink-underline block hover:text-paper">
                {settings.phone}
              </a>
              <p>
                {t.common.daily} · {settings.hours}
              </p>
            </address>
          </div>

          <div className="md:col-span-2">
            <p className="kicker text-paper/40">{t.footer.follow}</p>
            <div className="mt-6 flex gap-3">
              <a href={settings.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="grid size-11 place-items-center rounded-full border border-paper/20 transition-colors hover:border-gilt hover:text-gilt">
                <InstagramLogo size={18} weight="light" />
              </a>
              <a href="https://www.threads.com/@sin.chisinau" target="_blank" rel="noreferrer" aria-label="Threads" className="grid size-11 place-items-center rounded-full border border-paper/20 transition-colors hover:border-gilt hover:text-gilt">
                <ThreadsLogo size={18} weight="light" />
              </a>
            </div>
            <InkPaw className="mt-10 w-12 text-gilt/60" rough />
          </div>
        </div>

        <Ornament className="mt-20 w-full text-paper/15" />

        <DrawOnScroll start="top 95%" duration={2.2}>
          <Wordmark className="mx-auto -mb-[2%] mt-10 w-full max-w-[1400px] text-paper" />
        </DrawOnScroll>
      </div>

      <div className="relative border-t border-paper/10">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-5 py-6 font-mono text-[11px] tracking-[0.15em] text-paper/45 uppercase md:flex-row md:items-center md:justify-between md:px-10">
          <span>© 2026 SIN · {t.footer.rights}</span>
          <span>{t.footer.made}</span>
          <LocaleSwitch tone="dark" />
        </div>
      </div>
    </footer>
  );
}
