"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n/client";
import { ProductVisual } from "@/components/site/ProductVisual";
import { HaloGlyph } from "@/components/art/Wordmark";
import { FavoriteButton } from "./FavoriteButton";
import { ItemSheet } from "./ItemSheet";
import { cn } from "@/lib/cn";

export type MenuEntry = {
  id: string;
  slug: string;
  name: string;
  desc: string;
  price: number;
  portion: string | null;
  image: string | null;
  tags: string[];
  available: boolean;
  categorySlug: string;
};

export type MenuCategory = {
  slug: string;
  name: string;
  blurb: string;
  image: string | null;
  items: MenuEntry[];
};

const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function MenuBrowser({ categories }: { categories: MenuCategory[] }) {
  const { t } = useI18n();
  const root = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(categories[0]?.slug ?? "");
  const [open, setOpen] = useState<MenuEntry | null>(null);

  const filtered = useMemo(() => {
    const q = fold(query.trim());
    if (!q) return categories;
    return categories
      .map((c) => ({ ...c, items: c.items.filter((i) => fold(`${i.name} ${i.desc}`).includes(q)) }))
      .filter((c) => c.items.length);
  }, [categories, query]);

  useEffect(() => {
    const slug = decodeURIComponent(window.location.hash.slice(1));
    if (!slug) return;
    const item = categories.flatMap((c) => c.items).find((i) => i.slug === slug);
    if (!item) return;
    const el = document.getElementById(`item-${slug}`);
    const id = setTimeout(() => {
      if (el && window.__lenis) window.__lenis.scrollTo(el, { offset: -160 });
      else el?.scrollIntoView({ block: "center" });
      setOpen(item);
    }, 500);
    return () => clearTimeout(id);
  }, [categories]);

  useGSAP(
    () => {
      const triggers = Array.from(root.current!.querySelectorAll<HTMLElement>("[data-category]")).map((section) =>
        ScrollTrigger.create({
          trigger: section,
          start: "top 45%",
          end: "bottom 45%",
          onToggle: (self) => self.isActive && setActive(section.dataset.category!),
        }),
      );
      gsap.from("[data-rail] > *", { y: 30, opacity: 0, stagger: 0.05, duration: 0.9, ease: "silk", delay: 0.2 });
      return () => triggers.forEach((st) => st.kill());
    },
    { scope: root, dependencies: [filtered.length] },
  );

  const jump = (slug: string) => {
    const el = document.getElementById(`cat-${slug}`);
    if (!el) return;
    if (window.__lenis) window.__lenis.scrollTo(el, { offset: -130, duration: 1.4 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div ref={root}>
      <div data-rail className="no-scrollbar -mx-5 flex gap-5 overflow-x-auto px-5 pb-4 md:mx-0 md:gap-7 md:px-0">
        {categories.map((c) => (
          <button key={c.slug} type="button" onClick={() => jump(c.slug)} className="group flex w-24 shrink-0 flex-col items-center gap-3 text-center md:w-28">
            <span className={cn("relative block size-20 rounded-full p-1 transition-colors md:size-24", active === c.slug ? "bg-gilt" : "bg-transparent")}>
              <span className="block size-full overflow-hidden rounded-full bg-paper-2">
                <ProductVisual image={c.image} alt={c.name} categorySlug={c.slug} className="transition-transform duration-700 group-hover:scale-110" />
              </span>
              <HaloGlyph
                className={cn(
                  "absolute -top-2 left-1/2 w-10 -translate-x-1/2 text-gilt transition-all duration-500",
                  active === c.slug ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
                )}
              />
            </span>
            <span className={cn("text-[0.82rem] leading-tight transition-colors", active === c.slug ? "text-ink" : "text-ink-soft")}>{c.name}</span>
          </button>
        ))}
      </div>

      <div className="sticky top-16 z-30 -mx-5 mt-8 border-y border-ink/10 bg-paper/85 px-5 backdrop-blur-xl md:top-[72px] md:mx-0 md:rounded-full md:border md:px-6">
        <div className="flex items-center gap-4">
          <MagnifyingGlass size={18} weight="light" className="shrink-0 text-ink-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.menu.searchPlaceholder}
            aria-label={t.common.search}
            className="h-14 w-full bg-transparent outline-none placeholder:text-ink/35"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label={t.common.cancel} className="text-ink-soft hover:text-ink">
              <X size={16} />
            </button>
          )}
          <div className="no-scrollbar hidden max-w-[55%] gap-1 overflow-x-auto lg:flex">
            {filtered.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => jump(c.slug)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[0.8rem] whitespace-nowrap transition-colors",
                  active === c.slug ? "bg-ink text-paper" : "text-ink-soft hover:text-ink",
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 && <p className="py-32 text-center font-display text-3xl text-ink-soft italic">{t.menu.empty}</p>}

      {filtered.map((c, ci) => (
        <section key={c.slug} id={`cat-${c.slug}`} data-category={c.slug} className="grid gap-10 border-b border-ink/10 py-16 md:py-24 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-40">
              <span className="font-mono text-[11px] tracking-[0.2em] text-gilt">{String(ci + 1).padStart(2, "0")}</span>
              <h2 className="mt-3 font-display text-[clamp(2.6rem,4.4vw,4.4rem)] leading-[0.95] italic">{c.name}</h2>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">{c.blurb}</p>
              <div className="arch mt-8 hidden aspect-[3/4] w-48 overflow-hidden lg:block">
                <ProductVisual image={c.image} alt={c.name} categorySlug={c.slug} />
              </div>
            </div>
          </div>

          <ul className="divide-y divide-ink/10 lg:col-span-8">
            {c.items.map((item) => (
              <li key={item.id} id={`item-${item.slug}`}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setOpen(item)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setOpen(item))}
                  data-cursor={t.common.readMore}
                  className={cn("group flex cursor-pointer items-center gap-5 py-6 md:gap-7", !item.available && "opacity-50")}
                >
                  <span className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-paper-2 md:size-24">
                    <ProductVisual image={item.image} alt={item.name} categorySlug={item.categorySlug} className="transition-transform duration-700 group-hover:scale-110" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-3">
                      <span className="font-display text-[1.6rem] leading-tight transition-colors group-hover:text-cocoa md:text-[1.9rem]">{item.name}</span>
                      <span className="leader hidden sm:block" />
                      <span className="shrink-0 font-mono text-sm tabular">
                        {item.price} {t.common.lei}
                      </span>
                    </span>
                    <span className="mt-1.5 line-clamp-2 block max-w-xl text-sm leading-relaxed text-ink-soft">{item.desc}</span>
                    <span className="mt-3 flex flex-wrap items-center gap-2">
                      {!item.available && <Tag tone="cherry">{t.common.soldOut}</Tag>}
                      {item.tags.map((tag) => (
                        <Tag key={tag} tone={tag === "new" ? "cherry" : tag === "seasonal" ? "sage" : "gilt"}>
                          {t.common[tag as "new"] ?? tag}
                        </Tag>
                      ))}
                      {item.portion && <span className="font-mono text-[11px] text-ink-soft">{item.portion}</span>}
                    </span>
                  </span>
                  <FavoriteButton itemId={item.id} className="hidden sm:grid" />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p className="mx-auto max-w-xl py-16 text-center text-sm leading-relaxed text-ink-soft">{t.menu.note}</p>

      <ItemSheet item={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function Tag({ children, tone }: { children: React.ReactNode; tone: "cherry" | "sage" | "gilt" }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-[0.14em] uppercase",
        tone === "cherry" && "border-cherry/30 text-cherry",
        tone === "sage" && "border-sage-deep/30 text-sage-deep",
        tone === "gilt" && "border-gilt/40 text-[#8a6a2c]",
      )}
    >
      {children}
    </span>
  );
}
