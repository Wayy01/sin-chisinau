"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { claimQr as claim, redeemReward as redeem } from "@/lib/loyalty";

export async function toggleFavorite(itemId: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "auth" as const };
  const id = z.uuid().parse(itemId);
  const removed = await db
    .delete(schema.favorites)
    .where(and(eq(schema.favorites.userId, user.id), eq(schema.favorites.itemId, id)))
    .returning();
  if (removed.length) return { ok: true as const, favorite: false };
  await db.insert(schema.favorites).values({ userId: user.id, itemId: id }).onConflictDoNothing();
  return { ok: true as const, favorite: true };
}

export async function redeemReward(rewardId: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "auth" as const };
  return redeem(user.id, z.uuid().parse(rewardId));
}

export async function claimQrDrop(code: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "auth" as const };
  return claim(user.id, z.string().min(2).max(40).parse(code));
}

const profileSchema = z.object({
  name: z.string().trim().min(1).max(80),
  phone: z.string().trim().max(30).optional().transform((v) => v || null),
  birthday: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal(""))
    .transform((v) => v || null),
});

export async function updateProfile(_: unknown, form: FormData) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "auth" };
  const parsed = profileSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: "invalid" };
  await db.update(schema.users).set(parsed.data).where(eq(schema.users.id, user.id));
  return { ok: true, message: "saved" };
}
