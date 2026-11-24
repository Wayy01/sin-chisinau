import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

export function PageHeader({
  kicker,
  title,
  lead,
  aside,
  className,
}: {
  kicker: string;
  title: string;
  lead?: string;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mx-auto max-w-[1600px] px-5 pt-36 pb-12 md:px-10 md:pt-48 md:pb-16", className)}>
      <p className="kicker text-gilt">{kicker}</p>
      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-end">
        <Reveal as="h1" on="intro" className="text-[clamp(3.4rem,8.5vw,8.5rem)] leading-[0.88] tracking-[-0.03em] lg:col-span-8">
          {title}
        </Reveal>
        {(lead || aside) && (
          <div className="lg:col-span-4 lg:pb-3">
            {lead && <p className="max-w-md leading-relaxed text-ink-soft">{lead}</p>}
            {aside}
          </div>
        )}
      </div>
    </header>
  );
}
