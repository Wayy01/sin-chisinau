"use client";

import { useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/cn";

/** Calls a bound server action, optionally after a confirm(), then refreshes the page data. */
export function ActionButton({
  action,
  children,
  confirm: needsConfirm = false,
  className,
  redirectTo,
  title,
}: {
  action: () => Promise<unknown>;
  children: ReactNode;
  confirm?: boolean;
  className?: string;
  redirectTo?: string;
  title?: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      title={title}
      disabled={pending}
      onClick={() => {
        if (needsConfirm && !window.confirm(t.admin.confirmDelete)) return;
        start(async () => {
          try {
            await action();
            if (needsConfirm) toast.success(t.admin.deleted);
            if (redirectTo) router.push(redirectTo);
            else router.refresh();
          } catch (e) {
            toast.error((e as Error).message);
          }
        });
      }}
      className={cn(pending && "opacity-50", className)}
    >
      {children}
    </button>
  );
}

export function ToggleCell({ on, action }: { on: boolean; action: (next: boolean) => Promise<unknown> }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={pending}
      onClick={() => start(async () => (await action(!on), router.refresh()))}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-milk after:shadow after:transition-transform",
        on ? "bg-sage-deep after:translate-x-5" : "bg-ink/15",
        pending && "opacity-50",
      )}
    />
  );
}
