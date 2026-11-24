import { getT } from "@/lib/i18n/server";
import { PageTitle } from "@/components/admin/fields";
import { Scanner } from "@/components/admin/Scanner";

export default async function ScannerPage() {
  const { t } = await getT();
  return (
    <>
      <PageTitle kicker="Sinners Club" title={t.admin.scanner.title} />
      <Scanner />
    </>
  );
}
