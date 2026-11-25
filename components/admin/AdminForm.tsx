"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { CircleNotch } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/client";
import type { Result } from "@/lib/admin/actions";
import { cn } from "@/lib/cn";

/** Server-action form with toast feedback; a `redirect` in the result is resolved under /admin. */
export function AdminForm({
  action,
  children,
  className,
  resetOnSuccess = false,
}: {
  action: (prev: Result, form: FormData) => Promise<Result>;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [state, formAction] = useActionState(action, null);
  const handled = useRef<Result>(null);

  useEffect(() => {
    if (!state || handled.current === state) return;
    handled.current = state;
    if (state.ok) {
      toast.success(t.common.saved);
      if (state.redirect) router.push(`/${locale}/admin/${state.redirect}`);
      else router.refresh();
    } else {
      toast.error(state.message ?? "Error");
    }
  }, [state, locale, router, t]);

  return (
    <form
      action={formAction}
      className={cn("[&>*]:min-w-0", className)}
      onSubmit={(e) => {
        if (resetOnSuccess) {
          const form = e.currentTarget;
          setTimeout(() => form.reset(), 600);
        }
      }}
    >
      {children}
    </form>
  );
}

export function SubmitButton({ label, className }: { label?: string; className?: string }) {
  const { t } = useI18n();
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn("btn", className)}>
      {pending && <CircleNotch size={16} className="animate-spin" />}
      {label ?? t.common.save}
    </button>
  );
}
