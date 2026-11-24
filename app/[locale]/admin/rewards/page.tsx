import { asc } from "drizzle-orm";
import { Plus, Trash } from "@phosphor-icons/react/dist/ssr";
import { db, schema } from "@/db";
import type { Reward } from "@/db/schema";
import type { Dictionary } from "@/lib/i18n/dictionaries/ro";
import { requireAdmin } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { deleteReward, saveReward } from "@/lib/admin/actions";
import { AdminForm, SubmitButton } from "@/components/admin/AdminForm";
import { ActionButton } from "@/components/admin/ActionButton";
import { Area, Check, Field, PageTitle } from "@/components/admin/fields";
import { MediaPicker } from "@/components/admin/MediaPicker";

function RewardForm({ r, t }: { r?: Reward; t: Dictionary }) {
  const f = t.admin.fields;
  return (
    <AdminForm action={saveReward} resetOnSuccess={!r} className="grid gap-5 md:grid-cols-[220px_1fr]">
      {r && <input type="hidden" name="id" value={r.id} />}
      <MediaPicker name="image" label={f.image} defaultValue={r?.image} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={f.nameRo} name="nameRo" defaultValue={r?.nameRo} required />
        <Field label={f.nameRu} name="nameRu" defaultValue={r?.nameRu} required />
        <Area label={f.descRo} name="descRo" defaultValue={r?.descRo ?? ""} rows={2} />
        <Area label={f.descRu} name="descRu" defaultValue={r?.descRu ?? ""} rows={2} />
        <Field label={f.cost} name="cost" type="number" min={1} defaultValue={r?.cost} required />
        <Field label={f.sort} name="sort" type="number" defaultValue={r?.sort ?? 0} />
        <div className="flex items-center gap-6 md:col-span-2">
          <Check label={f.active} name="active" defaultChecked={r?.active ?? true} />
          <SubmitButton label={r ? t.common.save : t.common.create} />
        </div>
      </div>
    </AdminForm>
  );
}

export default async function AdminRewards() {
  const { locale, t } = await getT();
  await requireAdmin(locale);
  const rewards = await db.select().from(schema.rewards).orderBy(asc(schema.rewards.cost));

  return (
    <>
      <PageTitle kicker="Sinners Club" title={t.admin.rewards.title} />
      <details className="group mb-8 rounded-2xl border border-dashed border-ink/20 p-5">
        <summary className="flex cursor-pointer list-none items-center gap-2 font-display text-2xl">
          <Plus size={18} className="transition-transform group-open:rotate-45" /> {t.admin.rewards.add}
        </summary>
        <div className="mt-6">
          <RewardForm t={t} />
        </div>
      </details>
      <div className="space-y-5">
        {rewards.map((r) => (
          <div key={r.id} className="relative rounded-2xl border border-ink/10 bg-milk p-5">
            <ActionButton
              action={deleteReward.bind(null, r.id)}
              confirm
              title={t.common.delete}
              className="absolute top-4 right-4 grid size-9 place-items-center rounded-full text-cherry hover:bg-cherry/10"
            >
              <Trash size={16} />
            </ActionButton>
            <RewardForm r={r} t={t} />
          </div>
        ))}
      </div>
    </>
  );
}
