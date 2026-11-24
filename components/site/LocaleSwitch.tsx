"use client";

import Link from "next/link";
import { locales } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/cn";
import { WithPathname } from "@/components/motion/OnPathname";

export function LocaleSwitch({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const { locale } = useI18n();
  return (
    <div className={cn("flex items-center gap-1 font-mono text-[11px] tracking-[0.18em] uppercase", className)}>
      <WithPathname>
      {(pathname) => {
      const rest = pathname.split("/").slice(2).join("/");
      return locales.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span className="opacity-30">/</span>}
          <Link
            href={`/${l}${rest ? `/${rest}` : ""}`}
            hrefLang={l}
            onClick={() => {
              document.cookie = `sin_locale=${l};path=/;max-age=31536000;samesite=lax`;
            }}
            className={cn(
              "rounded-full px-1.5 py-1 transition-colors",
              l === locale
                ? tone === "dark"
                  ? "text-gilt"
                  : "text-ink"
                : tone === "dark"
                  ? "text-paper/45 hover:text-paper"
                  : "text-ink/40 hover:text-ink",
            )}
            aria-current={l === locale ? "true" : undefined}
          >
            {l}
          </Link>
        </span>
      ));
      }}
      </WithPathname>
    </div>
  );
}
