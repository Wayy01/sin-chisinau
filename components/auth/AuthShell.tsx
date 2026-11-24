import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { InkWings } from "@/components/art/Ink";
import { Wordmark } from "@/components/art/Wordmark";

/** Split layout: the putti watch over the form. */
export function AuthShell({ title, lead, note, children }: { title: string; lead: string; note: string; children: ReactNode }) {
  return (
    <section className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-night lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/art/putti.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-night/10" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-paper">
          <InkWings className="mb-6 w-40 text-gilt" weight={1.2} />
          <Wordmark className="w-36 text-paper" />
          <p className="script mt-6 max-w-sm text-3xl text-gilt-soft">{note}</p>
        </div>
      </div>
      <div className="flex items-center px-5 pt-32 pb-20 md:px-16 lg:px-20 lg:pt-36">
        <div className="mx-auto w-full max-w-md">
          <Reveal as="h1" on="intro" className="text-[clamp(2.8rem,5vw,4.4rem)] leading-[0.95]">
            {title}
          </Reveal>
          <p className="mt-5 leading-relaxed text-ink-soft">{lead}</p>
          <div className="mt-12">{children}</div>
        </div>
      </div>
    </section>
  );
}
