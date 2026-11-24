import { getCurrentUser } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { TLink } from "@/components/motion/PageTransition";
import { HaloGlyph } from "@/components/art/Wordmark";

export async function AccountChip() {
  const [user, { locale, t }] = await Promise.all([getCurrentUser(), getT()]);

  if (!user) {
    return (
      <div className="flex items-center gap-1">
        <TLink href={`/${locale}/login`} className="hidden rounded-full px-3 py-2 text-[0.9rem] text-ink-soft transition-colors hover:text-ink sm:block">
          {t.nav.login}
        </TLink>
        <TLink href={`/${locale}/register`} className="btn btn-sm">
          {t.nav.join}
        </TLink>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {user.role !== "member" && (
        <TLink href={`/${locale}/admin`} className="hidden rounded-full border border-ink/15 px-3 py-2 font-mono text-[10px] tracking-[0.2em] uppercase hover:border-gilt sm:block">
          {t.nav.admin}
        </TLink>
      )}
      <TLink
        href={`/${locale}/account`}
        className="group flex items-center gap-2.5 rounded-full border border-ink/15 bg-milk/60 py-1.5 pr-4 pl-1.5 transition-colors hover:border-gilt"
        aria-label={t.nav.account}
      >
        <span className="grid size-8 place-items-center rounded-full bg-ink font-display text-lg text-paper italic">
          {user.name.slice(0, 1)}
        </span>
        <span className="flex items-center gap-1.5 text-sm tabular">
          {user.halos}
          <HaloGlyph className="w-5 text-gilt transition-transform duration-500 group-hover:-rotate-12" />
        </span>
      </TLink>
    </div>
  );
}

export function AccountChipFallback() {
  return <div className="h-11 w-24 animate-pulse rounded-full bg-ink/5" />;
}
