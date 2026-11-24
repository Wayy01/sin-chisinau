"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleNotch } from "@phosphor-icons/react";
import { gsap } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n/client";
import { plural } from "@/lib/i18n/config";
import { claimQrDrop } from "@/lib/actions/member";
import { TLink } from "@/components/motion/PageTransition";
import { HaloGlyph } from "@/components/art/Wordmark";
import { InkWings } from "@/components/art/Ink";

type Outcome = { kind: "ok"; halos: number } | { kind: "error"; message: string } | null;

export function ClaimDrop({ code, halos, title }: { code: string; halos: number; title: string }) {
  const { locale, t } = useI18n();
  const [pending, start] = useTransition();
  const [outcome, setOutcome] = useState<Outcome>(null);
  const burst = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const celebrate = () => {
    const rings = burst.current!.querySelectorAll("[data-ring]");
    gsap.fromTo(rings, { scale: 0.2, opacity: 1 }, { scale: 3.2, opacity: 0, duration: 1.6, stagger: 0.18, ease: "power2.out" });
    gsap.fromTo("[data-amount]", { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: "elastic.out(1, 0.5)" });
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div ref={burst} className="relative grid size-56 place-items-center">
        <InkWings className="pointer-events-none absolute top-1/2 left-1/2 w-[340px] -translate-x-1/2 -translate-y-[62%] text-gilt/45" weight={1.1} />
        {[0, 1, 2].map((i) => (
          <span key={i} data-ring className="absolute h-10 w-28 rounded-[50%] border-2 border-gilt opacity-0" />
        ))}
        <HaloGlyph className="absolute top-6 w-24 animate-float text-gilt" />
        <p data-amount className="font-display text-8xl leading-none text-cocoa">
          +{halos}
        </p>
      </div>
      <p className="mt-2 font-mono text-[11px] tracking-[0.2em] text-ink-soft uppercase">{plural(locale, halos, t.common.halos)}</p>
      <p className="mt-6 font-display text-3xl italic">{title}</p>

      {outcome?.kind === "ok" ? (
        <div className="mt-10 flex flex-col items-center gap-4">
          <p className="text-lg">
            {t.qr.claimed} <strong>+{outcome.halos}</strong> {plural(locale, outcome.halos, t.common.halos)}.
          </p>
          <TLink href={`/${locale}/account`} className="btn">
            {t.qr.toAccount}
          </TLink>
        </div>
      ) : (
        <>
          {outcome?.kind === "error" && <p className="mt-8 rounded-full bg-cherry/10 px-5 py-2 text-cherry">{outcome.message}</p>}
          <button
            type="button"
            disabled={pending}
            className="btn btn-lg mt-10"
            onClick={() =>
              start(async () => {
                const res = await claimQrDrop(code);
                if (res.ok) {
                  setOutcome({ kind: "ok", halos: res.halos });
                  celebrate();
                  router.refresh();
                } else {
                  const map = { auth: t.qr.login, invalid: t.qr.invalid, expired: t.qr.expired, already: t.qr.already, full: t.qr.full };
                  setOutcome({ kind: "error", message: map[res.error] });
                }
              })
            }
          >
            {pending && <CircleNotch size={16} className="animate-spin" />}
            {t.qr.claimed} +{halos}
          </button>
        </>
      )}
    </div>
  );
}
