import { requireStaff } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { PageTitle } from "@/components/admin/fields";
import { Scanner } from "@/components/admin/Scanner";

export default async function ScannerPage() {
  const { locale, t } = await getT();
  await requireStaff(locale);
  return (
    <>
      <PageTitle kicker="Sinners Club" title={t.admin.scanner.title} />
      <Scanner />
    </>
  );
}
