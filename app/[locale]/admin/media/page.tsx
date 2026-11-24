import { desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { PageTitle } from "@/components/admin/fields";
import { MediaManager } from "@/components/admin/MediaManager";

export default async function AdminMedia() {
  const { locale, t } = await getT();
  await requireAdmin(locale);
  const rows = await db
    .select({ id: schema.media.id, url: schema.media.url, name: schema.media.name, mime: schema.media.mime, size: schema.media.size })
    .from(schema.media)
    .orderBy(desc(schema.media.createdAt));
  return (
    <>
      <PageTitle title={t.admin.media.title} />
      <MediaManager rows={rows} />
    </>
  );
}
