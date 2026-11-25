"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/client";
import { updateProfile } from "@/lib/actions/member";

export function ProfileForm({ name, phone, birthday }: { name: string; phone: string | null; birthday: string | null }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState(updateProfile, null);
  const handled = useRef(state);

  useEffect(() => {
    if (!state || handled.current === state) return;
    handled.current = state;
    if (state.ok) toast.success(t.account.profileSaved);
  }, [state, t]);

  return (
    <form action={action} className="grid gap-6 sm:grid-cols-3">
      <label className="block">
        <span className="font-mono text-[10px] tracking-[0.2em] text-ink-soft uppercase">{t.auth.name}</span>
        <input name="name" defaultValue={name} required className="field" />
      </label>
      <label className="block">
        <span className="font-mono text-[10px] tracking-[0.2em] text-ink-soft uppercase">{t.auth.phone}</span>
        <input name="phone" type="tel" defaultValue={phone ?? ""} className="field" />
      </label>
      <label className="block">
        <span className="font-mono text-[10px] tracking-[0.2em] text-ink-soft uppercase">{t.auth.birthday}</span>
        <input name="birthday" type="date" defaultValue={birthday ?? ""} disabled={!!birthday} className="field disabled:opacity-60" />
        {birthday && <span className="mt-2 block text-xs text-ink-soft">{t.auth.birthdayLocked}</span>}
      </label>
      <div className="sm:col-span-3">
        <button type="submit" disabled={pending} className="btn btn-line btn-sm">
          {t.common.save}
        </button>
      </div>
    </form>
  );
}
