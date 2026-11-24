import type { Metadata } from "next";
import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/config";
import { ClaimDrop } from "@/components/club/ClaimDrop";
import { TLink } from "@/components/motion/PageTransition";

export const metadata: Metadata = { robots: { index: false } };

async function Drop({ params }: { params: Promise<{ code: string }> }) {
  const [{ code: raw }, { locale, t }, user] = await Promise.all([params, getT(), getCurrentUser()]);
  const code = decodeURIComponent(raw).toUpperCase();
  const [drop] = await db.select().from(schema.qrDrops).where(eq(schema.qrDrops.code, code));
  const now = new Date();
  const live = drop && drop.active && (!drop.startsAt || drop.startsAt <= now) && (!drop.endsAt || drop.endsAt >= now);

  if (!drop || !live) {
    return <p className="font-display text-4xl italic">{drop ? t.qr.expired : t.qr.invalid}</p>;
  }
  if (!user) {
    const next = `/${locale}/q/${encodeURIComponent(code)}`;
    return (
      <div className="flex flex-col items-center gap-8">
        <p className="font-display text-8xl text-cocoa">+{drop.halos}</p>
        <p className="max-w-sm text-lg text-ink-soft">{t.qr.login}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <TLink href={`/${locale}/register?next=${encodeURIComponent(next)}`} className="btn">
            {t.nav.join}
          </TLink>
          <TLink href={`/${locale}/login?next=${encodeURIComponent(next)}`} className="btn btn-line">
            {t.nav.login}
          </TLink>
        </div>
      </div>
    );
  }
  return <ClaimDrop code={code} halos={drop.halos} title={pick(drop, "title", locale)} />;
}

export default async function QrPage({ params }: PageProps<"/[locale]/q/[code]">) {
  const { t } = await getT();
  return (
    <section className="relative grid min-h-dvh place-items-center overflow-hidden px-5 pt-28 pb-20 text-center">
      <div className="relative">
        <p className="kicker text-gilt">Sinners Club</p>
        <h1 className="mx-auto mt-6 max-w-3xl text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.95]">{t.qr.title}</h1>
        <div className="mt-12 flex justify-center">
          <Suspense fallback={<div className="size-56 animate-pulse rounded-full bg-ink/5" />}>
            <Drop params={params} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
