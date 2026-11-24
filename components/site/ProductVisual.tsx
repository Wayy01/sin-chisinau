import { InkCroissant, InkCup, InkCherries, InkWheat, PaintWash } from "@/components/art/Ink";
import { cn } from "@/lib/cn";

const DRINK_CATEGORIES = new Set(["coffee", "signature", "cold"]);

/** Product photo, or — when the team hasn't shot it yet — an ink sketch on a paint wash. */
export function ProductVisual({
  image,
  alt,
  categorySlug,
  className,
  sizes,
}: {
  image: string | null;
  alt: string;
  categorySlug?: string;
  className?: string;
  sizes?: string;
}) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={image} alt={alt} sizes={sizes} loading="lazy" decoding="async" className={cn("h-full w-full object-cover", className)} />
    );
  }
  const drink = categorySlug && DRINK_CATEGORIES.has(categorySlug);
  const Sketch = drink ? InkCup : categorySlug === "retail" ? InkWheat : alt.length % 2 ? InkCroissant : InkCherries;
  return (
    <div role="img" aria-label={alt} className={cn("relative grid h-full w-full place-items-center overflow-hidden bg-paper-2", className)}>
      <PaintWash className={cn("absolute inset-[-20%] w-[140%]", drink ? "text-sage" : "text-gilt-soft")} />
      <Sketch className="relative w-[58%] text-cocoa" weight={1.4} />
    </div>
  );
}
