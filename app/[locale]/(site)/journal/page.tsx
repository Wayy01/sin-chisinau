import type { Metadata } from "next";
import { getPosts } from "@/lib/data";
import { getT } from "@/lib/i18n/server";
import { PageHeader } from "@/components/site/PageHeader";
import { PostCard } from "@/components/site/PostCard";
import { Stagger } from "@/components/motion/Effects";
import { InkSteam } from "@/components/art/Ink";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t.journal.title, description: t.journal.lead };
}

export default async function JournalPage() {
  const [{ locale, t }, posts] = await Promise.all([getT(), getPosts()]);
  const [lead, ...rest] = posts;

  return (
    <>
      <PageHeader
        kicker={t.journal.kicker}
        title={t.journal.title}
        lead={t.journal.lead}
        aside={<InkSteam className="mt-8 hidden w-16 text-gilt lg:block" weight={1.3} />}
      />
      <div className="mx-auto max-w-[1600px] px-5 pb-32 md:px-10">
        {!lead ? (
          <p className="py-24 text-center font-display text-3xl text-ink-soft italic">{t.journal.empty}</p>
        ) : (
          <>
            <div className="grid gap-12 border-t border-ink/10 pt-12 lg:grid-cols-12">
              <PostCard post={lead} locale={locale} readLabel={t.common.readMore} size="lg" className="lg:col-span-7" />
              <div className="hidden lg:col-span-5 lg:flex lg:flex-col lg:justify-end">
                <p className="script text-4xl leading-tight text-cocoa">{t.home.manifestoSign}</p>
              </div>
            </div>
            <Stagger className="mt-20 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <PostCard key={post.id} post={post} locale={locale} readLabel={t.common.readMore} />
              ))}
            </Stagger>
          </>
        )}
      </div>
    </>
  );
}
