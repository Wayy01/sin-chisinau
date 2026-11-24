import { requireAdmin } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { PageTitle } from "@/components/admin/fields";
import { PostEditor } from "@/components/admin/PostEditor";

export default async function NewPost() {
  const { locale, t } = await getT();
  await requireAdmin(locale);
  return (
    <>
      <PageTitle kicker={t.admin.journal.title} title={t.admin.journal.add} />
      <PostEditor />
    </>
  );
}
