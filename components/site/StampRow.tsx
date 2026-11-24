import { cn } from "@/lib/cn";

const TOTAL = 6;

/** Six tiny cups; filled ones are inked, the seventh is on the house. */
export function StampRow({ filled, tone = "light", className }: { filled: number; tone?: "light" | "dark"; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5", className)} aria-label={`${filled}/${TOTAL}`}>
      {Array.from({ length: TOTAL }, (_, i) => {
        const on = i < filled;
        return (
          <svg key={i} viewBox="0 0 32 32" className={cn("size-8", on ? (tone === "dark" ? "text-gilt" : "text-cocoa") : tone === "dark" ? "text-paper/25" : "text-ink/20")} aria-hidden>
            <g fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
              <path d="M7 12h16l-1.6 11.2A3 3 0 0 1 18.4 26h-6.8a3 3 0 0 1-3-2.8Z" />
              <path d="M23 14.5c3.2-.4 3.6 5.4-.6 5.5" fill="none" />
            </g>
            {on && <ellipse cx="15" cy="7" rx="5" ry="1.6" fill="none" stroke="currentColor" strokeWidth="1.2" />}
          </svg>
        );
      })}
    </div>
  );
}
