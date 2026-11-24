"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/client";
import { setRole } from "@/lib/admin/actions";

export function RoleSelect({ userId, role }: { userId: string; role: "member" | "staff" | "admin" }) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <label className="flex items-center gap-3">
      <span className="font-mono text-[10px] tracking-[0.18em] text-ink-soft uppercase">{t.admin.fields.role}</span>
      <select
        defaultValue={role}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as typeof role;
          start(async () => {
            try {
              await setRole(userId, next);
              toast.success(t.common.saved);
              router.refresh();
            } catch (err) {
              toast.error((err as Error).message);
            }
          });
        }}
        className="box-field w-auto"
      >
        <option value="member">member</option>
        <option value="staff">staff</option>
        <option value="admin">admin</option>
      </select>
    </label>
  );
}
