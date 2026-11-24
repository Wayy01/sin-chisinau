import { requireAdmin } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { getSettings } from "@/lib/data";
import { saveSettings } from "@/lib/admin/actions";
import { AdminForm, SubmitButton } from "@/components/admin/AdminForm";
import { Area, Card, Field, PageTitle } from "@/components/admin/fields";

export default async function AdminSettings() {
  const { locale, t } = await getT();
  await requireAdmin(locale);
  const s = await getSettings();
  const l = t.admin.settings;

  return (
    <>
      <PageTitle title={l.title} />
      <AdminForm action={saveSettings} className="space-y-6">
        <Card>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label={l.address} name="address" defaultValue={s.address} required />
            <Field label={l.phone} name="phone" defaultValue={s.phone} required />
            <Field label={l.hours} name="hours" defaultValue={s.hours} required placeholder="08:00–21:00" />
            <Field label={l.instagram} name="instagram" type="url" defaultValue={s.instagram} />
            <Field label={l.mapsUrl} name="mapsUrl" type="url" defaultValue={s.mapsUrl} className="md:col-span-2" />
          </div>
        </Card>
        <Card>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label={l.announcementRo} name="announcementRo" defaultValue={s.announcementRo} />
            <Field label={l.announcementRu} name="announcementRu" defaultValue={s.announcementRu} />
            <Area label={l.heroLeadRo} name="heroLeadRo" defaultValue={s.heroLeadRo} rows={3} placeholder={t.home.heroLead} />
            <Area label={l.heroLeadRu} name="heroLeadRu" defaultValue={s.heroLeadRu} rows={3} />
          </div>
        </Card>
        <SubmitButton className="btn-lg" />
      </AdminForm>
    </>
  );
}
