import { Play } from "@phosphor-icons/react/dist/ssr";
import type { Post } from "@/db/schema";
import { pick, formatDate, type Locale } from "@/lib/i18n/config";
import { TLink } from "@/components/motion/PageTransition";
import { cn } from "@/lib/cn";

export function PostCard({
  post,
  locale,
  readLabel,
  size = "md",
  className,
}: {
  post: Post;
  locale: Locale;
  readLabel: string;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <TLink href={`/${locale}/journal/${post.slug}`} data-cursor={readLabel} className={cn("group flex flex-col", className)}>
      <div className={cn("relative overflow-hidden rounded-[1.5rem] bg-paper-2", size === "lg" ? "aspect-[4/5]" : "aspect-[4/3]")}>
        {post.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
          />
        )}
        {post.video && (
          <span className="absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-paper/90 text-ink backdrop-blur">
            <Play size={14} weight="fill" />
          </span>
        )}
      </div>
      <p className="mt-5 font-mono text-[11px] tracking-[0.18em] text-ink-soft uppercase">
        {post.publishedAt && formatDate(post.publishedAt, locale)}
      </p>
      <h3 className={cn("mt-2 font-display leading-[1.02] transition-colors group-hover:text-cocoa", size === "lg" ? "text-[clamp(2rem,3vw,2.8rem)]" : "text-[1.8rem]")}>
        {pick(post, "title", locale)}
      </h3>
      <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-relaxed text-ink-soft">{pick(post, "excerpt", locale)}</p>
    </TLink>
  );
}
