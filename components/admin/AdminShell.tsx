"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartLineUp,
  QrCode,
  Scan,
  ForkKnife,
  SquaresFour,
  Notebook,
  Images,
  Gift,
  Users,
  GearSix,
  ArrowSquareOut,
  List,
  X,
} from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n/client";
import { Wordmark } from "@/components/art/Wordmark";
import { cn } from "@/lib/cn";

type Role = "staff" | "admin";

export function AdminShell({ user, children }: { user: { name: string; role: Role }; children: ReactNode }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const base = `/${locale}/admin`;
  const other = locale === "ro" ? "ru" : "ro";

  const all: { href: string; label: string; Icon: typeof Scan; roles: Role[] }[] = [
    { href: base, label: t.admin.nav.overview, Icon: ChartLineUp, roles: ["admin"] },
    { href: `${base}/scanner`, label: t.admin.nav.scanner, Icon: Scan, roles: ["admin", "staff"] },
    { href: `${base}/menu`, label: t.admin.nav.menu, Icon: ForkKnife, roles: ["admin"] },
    { href: `${base}/categories`, label: t.admin.nav.categories, Icon: SquaresFour, roles: ["admin"] },
    { href: `${base}/journal`, label: t.admin.nav.journal, Icon: Notebook, roles: ["admin"] },
    { href: `${base}/media`, label: t.admin.nav.media, Icon: Images, roles: ["admin"] },
    { href: `${base}/rewards`, label: t.admin.nav.rewards, Icon: Gift, roles: ["admin"] },
    { href: `${base}/qr`, label: t.admin.nav.qr, Icon: QrCode, roles: ["admin"] },
    { href: `${base}/members`, label: t.admin.nav.members, Icon: Users, roles: ["admin", "staff"] },
    { href: `${base}/settings`, label: t.admin.nav.settings, Icon: GearSix, roles: ["admin"] },
  ];
  const nav = all.filter((n) => n.roles.includes(user.role));

  const isActive = (href: string) => (href === base ? pathname === base : pathname.startsWith(href));

  const links = (
    <nav className="flex flex-col gap-0.5">
      {nav.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.92rem] transition-colors",
            isActive(href) ? "bg-ink text-paper" : "text-ink-soft hover:bg-ink/5 hover:text-ink",
          )}
        >
          <Icon size={18} weight={isActive(href) ? "fill" : "light"} className={isActive(href) ? "text-gilt" : ""} />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[260px_1fr] print:block">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-ink/10 bg-milk/60 p-5 lg:flex print:!hidden">
        <Link href={base} className="flex items-center gap-3 px-2 py-3">
          <Wordmark className="w-16 text-ink" />
          <span className="font-mono text-[10px] tracking-[0.2em] text-ink-soft uppercase">Admin</span>
        </Link>
        <div className="mt-6 flex-1 overflow-y-auto">{links}</div>
        <Link href={`/${locale}`} className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-ink-soft hover:text-ink">
          <ArrowSquareOut size={16} /> {t.admin.nav.site}
        </Link>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-ink/10 bg-paper/85 px-5 backdrop-blur-xl md:px-8 print:hidden">
          <button type="button" onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-full border border-ink/15 lg:hidden" aria-label={t.nav.open}>
            <List size={18} />
          </button>
          <span className="font-display text-2xl lg:hidden">SIN</span>
          <div className="ml-auto flex items-center gap-4">
            <Link
              href={pathname.replace(`/${locale}/`, `/${other}/`)}
              className="rounded-full border border-ink/15 px-3 py-1.5 font-mono text-[11px] tracking-[0.18em] uppercase hover:border-gilt"
            >
              {other}
            </Link>
            <div className="text-right leading-tight">
              <p className="text-sm">{user.name}</p>
              <p className="font-mono text-[10px] tracking-[0.18em] text-gilt uppercase">{user.role}</p>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1280px] px-5 py-8 md:px-8 md:py-10 print:p-0">{children}</main>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-night/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-paper p-5">
            <div className="flex items-center justify-between">
              <Wordmark className="w-16" />
              <button type="button" onClick={() => setOpen(false)} aria-label={t.nav.close}>
                <X size={20} />
              </button>
            </div>
            <div className="mt-6 flex-1 overflow-y-auto">{links}</div>
            <Link href={`/${locale}`} className="flex items-center gap-2 px-3 py-2.5 text-sm text-ink-soft">
              <ArrowSquareOut size={16} /> {t.admin.nav.site}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
