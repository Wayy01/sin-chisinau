import { getT } from "@/lib/i18n/server";
import { TLink } from "@/components/motion/PageTransition";
import { InkCroissant } from "@/components/art/Ink";
import { DrawOnScroll } from "@/components/motion/Effects";

export default async function NotFound() {
  const { locale, t } = await getT();
  return (
    <main className="grid min-h-dvh place-items-center px-5 text-center">
      <div>
        <DrawOnScroll start="top bottom" duration={2}>
          <InkCroissant className="mx-auto w-56 text-gilt" weight={1.3} />
        </DrawOnScroll>
        <p className="mt-8 font-display text-[clamp(6rem,18vw,14rem)] leading-none italic text-cocoa">404</p>
        <h1 className="mt-4 text-[clamp(2rem,4vw,3.4rem)]">{t.notFound.title}</h1>
        <p className="mt-4 text-ink-soft">{t.notFound.text}</p>
        <TLink href={`/${locale}`} className="btn mt-10">
          {t.notFound.home}
        </TLink>
      </div>
    </main>
  );
}
