import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { PageTitle } from "@/components/admin/fields";
import { PostEditor } from "@/components/admin/PostEditor";

export default async function EditPost({ params }: PageProps<"/[locale]/admin/journal/[id]">) {
  const [{ id }, { locale, t }] = await Promise.all([params, getT()]);
  await requireAdmin(locale);
  if (!z.uuid().safeParse(id).success) notFound();
  const [post] = await db.select().from(schema.posts).where(eq(schema.posts.id, id));
  if (!post) notFound();
  return (
    <>
      <PageTitle kicker={t.admin.journal.title} title={post.titleRo} />
      <PostEditor post={post} />
    </>
  );
}
