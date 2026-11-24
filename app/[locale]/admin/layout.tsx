import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { requireStaff } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { Wordmark } from "@/components/art/Wordmark";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

async function Gate({ children }: { children: ReactNode }) {
  const { locale } = await getT();
  const user = await requireStaff(locale);
  return <AdminShell user={{ name: user.name, role: user.role as "staff" | "admin" }}>{children}</AdminShell>;
}

export default function AdminLayout({ children }: LayoutProps<"/[locale]/admin">) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-dvh place-items-center">
          <Wordmark className="w-28 animate-pulse text-ink/40" />
        </div>
      }
    >
      <Gate>{children}</Gate>
    </Suspense>
  );
}
