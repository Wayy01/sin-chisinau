import { getT } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/config";
import { getFeaturedItems, getMenu, getPosts, getSeasonalDrinks, getSettings } from "@/lib/data";
import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { Confessions } from "@/components/home/Confessions";
import { Manifesto } from "@/components/home/Manifesto";
import { Film } from "@/components/home/Film";
import { ArtInterlude } from "@/components/home/ArtInterlude";
import { ClubTeaser } from "@/components/home/ClubTeaser";
import { Season } from "@/components/home/Season";
import { Visit } from "@/components/home/Visit";
import { PostCard } from "@/components/site/PostCard";
import { TLink } from "@/components/motion/PageTransition";
import { Reveal } from "@/components/motion/Reveal";

export default async function Home() {
  const [{ locale, t }, settings, featured, menu, seasonal, posts] = await Promise.all([
    getT(),
    getSettings(),
    getFeaturedItems(),
    getMenu(),
    getSeasonalDrinks(),
    getPosts(3),
  ]);
  const categoryOf = new Map(menu.flatMap((c) => c.items.map((i) => [i.id, c.slug] as const)));
  const heroLead = locale === "ro" ? settings.heroLeadRo : settings.heroLeadRu;

  return (
    <>
      <Hero lead={heroLead} hours={settings.hours} />
      <Marquee items={t.home.marquee} className="border-y border-ink/10" />
      <Confessions
        items={featured.map((item) => ({
          slug: item.slug,
          name: pick(item, "name", locale),
          desc: pick(item, "desc", locale),
          price: item.price,
          image: item.image,
          portion: item.portion,
          tags: item.tags,
          categorySlug: categoryOf.get(item.id) ?? "",
        }))}
      />
      <Manifesto kicker={t.home.manifestoKicker} text={t.home.manifesto} sign={t.home.manifestoSign} />
      <Film
        kicker={t.home.filmKicker}
        title={t.home.filmTitle}
        lead={t.home.filmLead}
        src="/media/video/rainy-day.mp4"
        poster="/media/video/rainy-day.webp"
      />
      <ArtInterlude note={t.home.artNote} />
      <ClubTeaser locale={locale} t={t} />
      <Season locale={locale} t={t} items={seasonal} />

      {posts.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-5 py-28 md:px-10 md:py-40">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="kicker text-gilt">{t.home.journalKicker}</p>
              <Reveal as="h2" className="mt-6 text-giant">
                {t.home.journalTitle}
              </Reveal>
            </div>
            <TLink href={`/${locale}/journal`} className="btn btn-line">
              {t.common.viewAll}
            </TLink>
          </div>
          <div className="mt-16 grid gap-12 md:grid-cols-12 md:gap-8">
            <PostCard post={posts[0]} locale={locale} readLabel={t.common.readMore} size="lg" className="md:col-span-6" />
            <div className="grid gap-12 md:col-span-6 md:grid-cols-2 md:gap-8 md:pt-32">
              {posts.slice(1).map((post) => (
                <PostCard key={post.id} post={post} locale={locale} readLabel={t.common.readMore} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Marquee items={t.home.marquee.slice().reverse()} reverse className="border-y border-ink/10 bg-paper-2" />
      <Visit t={t} settings={settings} />
    </>
  );
}
