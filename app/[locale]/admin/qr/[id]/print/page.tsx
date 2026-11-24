import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { getDictionary, getT } from "@/lib/i18n/server";
import { plural } from "@/lib/i18n/config";
import { publicOrigin } from "@/lib/admin/origin";
import { qrSvg } from "@/lib/qr";
import { Wordmark } from "@/components/art/Wordmark";
import { PrintButton } from "@/components/admin/PrintButton";

export default async function PrintQr({ params }: PageProps<"/[locale]/admin/qr/[id]/print">) {
  const [{ id }, { locale, t }] = await Promise.all([params, getT()]);
  await requireAdmin(locale);
  if (!z.uuid().safeParse(id).success) notFound();
  const [drop] = await db.select().from(schema.qrDrops).where(eq(schema.qrDrops.id, id));
  if (!drop) notFound();
  const origin = await publicOrigin();
  const svg = await qrSvg(`${origin}/${locale}/q/${drop.code}`);
  const ro = getDictionary("ro");
  const ru = getDictionary("ru");

  return (
    <div className="flex flex-col items-center gap-6">
      <PrintButton label={t.admin.qr.print} />
      <article className="flex aspect-[148/210] w-full max-w-[520px] flex-col items-center justify-between rounded-[2rem] border border-ink/15 bg-paper p-10 text-center shadow-xl print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        <Wordmark className="w-28 text-ink" />
        <div>
          <p className="kicker text-gilt">Sinners Club</p>
          <h1 className="mt-4 text-5xl leading-none italic">{drop.titleRo}</h1>
          <p className="mt-2 font-display text-2xl text-ink-soft">{drop.titleRu}</p>
        </div>
        <div className="w-[70%] rounded-3xl bg-white p-5" dangerouslySetInnerHTML={{ __html: svg }} />
        <div>
          <p className="font-display text-5xl text-cherry">+{drop.halos}</p>
          <p className="mt-1 font-mono text-[11px] tracking-[0.18em] uppercase">
            {plural("ro", drop.halos, ro.common.halos)} · {plural("ru", drop.halos, ru.common.halos)}
          </p>
          <p className="mt-4 text-sm text-ink-soft">{ro.admin.qr.scanHint}</p>
          <p className="text-sm text-ink-soft">{ru.admin.qr.scanHint}</p>
        </div>
      </article>
    </div>
  );
}
