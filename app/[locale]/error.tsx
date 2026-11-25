"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n/client";
import { InkCup } from "@/components/art/Ink";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  const { t } = useI18n();
  // Server errors arrive with a digest that matches the server log line; worth showing for support.
  const digest = error instanceof Error && "digest" in error ? String(error.digest) : null;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-28 text-center">
      <div className="max-w-lg">
        <InkCup className="mx-auto w-28 text-gilt" weight={1.3} />
        <h1 className="mt-8 text-[clamp(2.2rem,6vw,3.6rem)]">{t.error.title}</h1>
        <p className="mt-4 leading-relaxed text-ink-soft">{t.error.text}</p>
        <button type="button" onClick={() => retry()} className="btn mt-10">
          {t.error.retry}
        </button>
        {digest && <p className="mt-8 font-mono text-[10px] tracking-[0.18em] text-ink-soft/70 uppercase">{digest}</p>}
      </div>
    </main>
  );
}
