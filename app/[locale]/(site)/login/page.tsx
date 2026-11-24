import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t.nav.login, robots: { index: false } };
}

async function Form({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ next }, user, { locale }] = await Promise.all([searchParams, getCurrentUser(), getT()]);
  if (user) redirect(`/${locale}/account`);
  return <AuthForm mode="login" next={typeof next === "string" ? next : undefined} />;
}

export default async function LoginPage({ searchParams }: PageProps<"/[locale]/login">) {
  const { t } = await getT();
  return (
    <AuthShell title={t.auth.loginTitle} lead={t.auth.loginLead} note={t.home.clubTitleA + " " + t.home.clubTitleB}>
      <Suspense fallback={<div className="h-80 animate-pulse rounded-3xl bg-ink/5" />}>
        <Form searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}
