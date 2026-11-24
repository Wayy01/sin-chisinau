import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { getPost, getPosts, readingMinutes } from "@/lib/data";
import { getT } from "@/lib/i18n/server";
import { formatDate, pick } from "@/lib/i18n/config";
import { TLink } from "@/components/motion/PageTransition";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Effects";
import { PostCard } from "@/components/site/PostCard";
import { Ornament } from "@/components/art/Ink";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/journal/[slug]">): Promise<Metadata> {
  const [{ slug }, { locale }] = await Promise.all([params, getT()]);
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: pick(post, "title", locale),
    description: pick(post, "excerpt", locale),
    openGraph: post.cover ? { images: [post.cover] } : undefined,
  };
}

async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, { locale, t }] = await Promise.all([params, getT()]);
  const [post, all] = await Promise.all([getPost(slug), getPosts()]);
  if (!post) notFound();

  const body = pick(post, "body", locale);
  const html = await marked.parse(body);
  const more = all.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <article>
      <header className="mx-auto max-w-[1600px] px-5 pt-36 md:px-10 md:pt-48">
        <TLink href={`/${locale}/journal`} className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-ink-soft uppercase hover:text-ink">
          <ArrowLeft size={14} /> {t.journal.kicker}
        </TLink>
        <p className="mt-10 font-mono text-[11px] tracking-[0.2em] text-gilt uppercase">
          {post.publishedAt && formatDate(post.publishedAt, locale)} · {readingMinutes(body)} {t.journal.minRead}
        </p>
        <Reveal as="h1" on="intro" className="mt-6 max-w-5xl text-[clamp(3rem,7vw,7rem)] leading-[0.92] tracking-[-0.03em]">
          {pick(post, "title", locale)}
        </Reveal>
        <p className="mt-8 max-w-2xl text-xl leading-relaxed text-ink-soft">{pick(post, "excerpt", locale)}</p>
      </header>

      {(post.video || post.cover) && (
        <div className="mx-auto mt-16 max-w-[1600px] px-5 md:px-10">
          <div className="relative overflow-hidden rounded-[2rem] bg-night">
            <Parallax speed={0.1}>
              {post.video ? (
                <video
                  src={post.video}
                  poster={post.cover ?? undefined}
                  className="mx-auto max-h-[85vh] w-full object-contain"
                  controls
                  muted
                  autoPlay
                  loop
                  playsInline
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.cover!} alt="" className="mx-auto max-h-[85vh] w-full object-cover" />
              )}
            </Parallax>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[760px] px-5 py-20 md:py-28">
        <div className="prose-sin" dangerouslySetInnerHTML={{ __html: html }} />
        <Ornament className="mt-20 w-full text-gilt" />
      </div>

      {more.length > 0 && (
        <section className="mx-auto max-w-[1600px] border-t border-ink/10 px-5 py-24 md:px-10">
          <h2 className="text-huge">{t.journal.more}</h2>
          <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((p) => (
              <PostCard key={p.id} post={p} locale={locale} readLabel={t.common.readMore} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

export default function PostPage({ params }: PageProps<"/[locale]/journal/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <Article params={params} />
    </Suspense>
  );
}
