"use client";

import { useEffect, useTransition } from "react";
import { Heart } from "@phosphor-icons/react";
import { toast } from "sonner";
import { gsap } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n/client";
import { favorites, useFavorites } from "@/lib/favorites-store";
import { toggleFavorite } from "@/lib/actions/member";
import { cn } from "@/lib/cn";

export function FavoriteButton({ itemId, className }: { itemId: string; className?: string }) {
  const { t } = useI18n();
  const { ids, loggedIn, ready } = useFavorites();
  const [pending, start] = useTransition();
  const on = ids.has(itemId);

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={on}
      aria-label={on ? t.menu.removeFavorite : t.menu.addFavorite}
      onClick={(e) => {
        e.stopPropagation();
        if (ready && !loggedIn) {
          toast(t.menu.favoriteLogin);
          return;
        }
        const icon = e.currentTarget.querySelector("svg");
        gsap.fromTo(icon, { scale: 0.6 }, { scale: 1, duration: 0.6, ease: "elastic.out(1.2, 0.4)" });
        favorites.set(itemId, !on);
        start(async () => {
          const res = await toggleFavorite(itemId);
          if (!res.ok) {
            favorites.set(itemId, on);
            toast(t.menu.favoriteLogin);
          }
        });
      }}
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full border transition-colors",
        on ? "border-cherry bg-cherry text-milk" : "border-ink/15 text-ink-soft hover:border-cherry hover:text-cherry",
        className,
      )}
    >
      <Heart size={16} weight={on ? "fill" : "light"} />
    </button>
  );
}

export function FavoritesHydrator({ ids, loggedIn }: { ids: string[]; loggedIn: boolean }) {
  useEffect(() => favorites.hydrate(ids, loggedIn), [ids, loggedIn]);
  return null;
}
