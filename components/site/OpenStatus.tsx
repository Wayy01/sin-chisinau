"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/cn";

function isOpen(hours: string) {
  const match = hours.match(/(\d{1,2}):(\d{2})\D+(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const [, h1, m1, h2, m2] = match.map(Number);
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Chisinau" }));
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= h1 * 60 + m1 && minutes < h2 * 60 + m2;
}

/** Live open/closed pill, computed in Chișinău time on the client. */
export function OpenStatus({ hours, className }: { hours: string; className?: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const update = () => setOpen(isOpen(hours));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [hours]);

  return (
    <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] uppercase", className)}>
      <span className="relative flex size-2">
        {open && <span className="absolute inset-0 animate-ping rounded-full bg-sage opacity-70" />}
        <span className={cn("relative size-2 rounded-full", open === null ? "bg-ink/20" : open ? "bg-sage-deep" : "bg-cherry")} />
      </span>
      {open === null ? hours : `${open ? t.common.openNow : t.common.closedNow} · ${hours}`}
    </span>
  );
}
