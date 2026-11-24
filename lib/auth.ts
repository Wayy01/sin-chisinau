import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { db, schema } from "@/db";
import type { Locale } from "@/lib/i18n/config";

export { hashPassword, verifyPassword, randomCode, newMemberCode } from "@/lib/crypto";

export const SESSION_COOKIE = "sin_session";
const SESSION_DAYS = 60;

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5);
  await db.insert(schema.sessions).values({ id: sha256(token), userId, expiresAt });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(schema.sessions).where(eq(schema.sessions.id, sha256(token)));
  store.delete(SESSION_COOKIE);
}

/** The signed-in user for this request, or null. Deduped per request. */
export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [row] = await db
    .select({ user: schema.users })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .where(and(eq(schema.sessions.id, sha256(token)), gt(schema.sessions.expiresAt, new Date())))
    .limit(1);
  return row?.user ?? null;
});

export async function requireUser(locale: Locale, next?: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  return user;
}

export async function requireStaff(locale: Locale) {
  const user = await requireUser(locale, `/${locale}/admin`);
  if (user.role === "member") redirect(`/${locale}/account`);
  return user;
}

export async function requireAdmin(locale: Locale) {
  const user = await requireStaff(locale);
  if (user.role !== "admin") redirect(`/${locale}/admin/scanner`);
  return user;
}
