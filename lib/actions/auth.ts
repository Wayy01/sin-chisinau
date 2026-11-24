"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { createSession, destroySession, hashPassword, newMemberCode, verifyPassword } from "@/lib/auth";
import { grantWelcome } from "@/lib/loyalty";
import { isLocale } from "@/lib/i18n/config";

export type AuthState = { error?: "invalid" | "exists" | "weak" | "name" | "email"; email?: string; name?: string } | null;

function safeNext(next: unknown, locale: string) {
  const fallback = `/${locale}/account`;
  if (typeof next !== "string" || !next.startsWith(`/${locale}/`) || next.startsWith("//")) return fallback;
  return next;
}

const localeOf = (form: FormData) => {
  const l = String(form.get("locale"));
  return isLocale(l) ? l : "ro";
};

export async function login(_: AuthState, form: FormData): Promise<AuthState> {
  const locale = localeOf(form);
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash))) return { error: "invalid", email };
  await createSession(user.id);
  redirect(safeNext(form.get("next"), locale));
}

const registerSchema = z.object({
  name: z.string().trim().min(1, "name").max(80, "name"),
  email: z.email("email").transform((v) => v.toLowerCase()),
  password: z.string().min(8, "weak").max(200, "weak"),
  phone: z.string().trim().max(30).optional(),
  birthday: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal("")),
});

export async function register(_: AuthState, form: FormData): Promise<AuthState> {
  const locale = localeOf(form);
  const raw = Object.fromEntries(form);
  const parsed = registerSchema.safeParse({ ...raw, email: String(raw.email ?? "").trim() });
  if (!parsed.success) {
    const code = parsed.error.issues[0]?.message as NonNullable<AuthState>["error"];
    return { error: code ?? "invalid", email: String(raw.email ?? ""), name: String(raw.name ?? "") };
  }
  const { name, email, password, phone, birthday } = parsed.data;
  const [exists] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email));
  if (exists) return { error: "exists", email, name };

  const [user] = await db
    .insert(schema.users)
    .values({
      name,
      email,
      passwordHash: await hashPassword(password),
      phone: phone || null,
      birthday: birthday || null,
      memberCode: newMemberCode(),
      locale,
    })
    .returning();
  await grantWelcome(user.id);
  await createSession(user.id);
  redirect(safeNext(form.get("next"), locale));
}

export async function logout(form: FormData) {
  await destroySession();
  redirect(`/${localeOf(form)}`);
}
