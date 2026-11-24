"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, CircleNotch } from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n/client";
import { login, register, type AuthState } from "@/lib/actions/auth";
import { TLink } from "@/components/motion/PageTransition";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-lg mt-4 w-full">
      {pending ? <CircleNotch size={18} className="animate-spin" /> : label}
      {!pending && <ArrowRight size={16} />}
    </button>
  );
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] tracking-[0.2em] text-ink-soft uppercase">{label}</span>
      <input {...props} className="field text-lg" />
    </label>
  );
}

export function AuthForm({ mode, next }: { mode: "login" | "register"; next?: string }) {
  const { locale, t } = useI18n();
  const [state, action] = useActionState<AuthState, FormData>(mode === "login" ? login : register, null);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />
      {next && <input type="hidden" name="next" value={next} />}

      {mode === "register" && <Field label={t.auth.name} name="name" autoComplete="name" required defaultValue={state?.name} />}
      <Field label={t.auth.email} name="email" type="email" autoComplete="email" required defaultValue={state?.email} />
      <Field
        label={t.auth.password}
        name="password"
        type="password"
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        minLength={mode === "register" ? 8 : undefined}
        required
      />
      {mode === "register" && (
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={t.auth.phone} name="phone" type="tel" autoComplete="tel" />
          <Field label={t.auth.birthday} name="birthday" type="date" />
        </div>
      )}

      {state?.error && (
        <p role="alert" className="rounded-xl border border-cherry/25 bg-cherry/5 px-4 py-3 text-sm text-cherry">
          {t.auth.errors[state.error]}
        </p>
      )}

      <Submit label={mode === "login" ? t.auth.submitLogin : t.auth.submitRegister} />

      <p className="text-center text-sm text-ink-soft">
        {mode === "login" ? t.auth.noAccount : t.auth.haveAccount}{" "}
        <TLink
          href={`/${locale}/${mode === "login" ? "register" : "login"}${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="ink-underline text-ink"
        >
          {mode === "login" ? t.nav.join : t.nav.login}
        </TLink>
      </p>
    </form>
  );
}
