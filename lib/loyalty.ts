import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { randomCode } from "@/lib/crypto";

export const LEI_PER_HALO = 10;
export const WELCOME_HALOS = 50;
export const BIRTHDAY_HALOS = 100;
/** New accounts wait this long for the birthday gift, so it cannot be farmed by signing up on the day. */
export const BIRTHDAY_MIN_MEMBER_DAYS = 30;
export const STAMPS_FOR_FREE_COFFEE = 6;

export const TIERS = [
  { key: "temptation", min: 0, multiplier: 1 },
  { key: "sinner", min: 500, multiplier: 1.1 },
  { key: "saint", min: 1500, multiplier: 1.25 },
] as const;
export type TierKey = (typeof TIERS)[number]["key"];

export function tierFor(lifetime: number) {
  let index = 0;
  TIERS.forEach((tier, i) => {
    if (lifetime >= tier.min) index = i;
  });
  const tier = TIERS[index];
  const next = TIERS[index + 1] ?? null;
  const progress = next ? (lifetime - tier.min) / (next.min - tier.min) : 1;
  return { tier, next, progress: Math.min(1, Math.max(0, progress)) };
}

export function halosForPurchase(amountLei: number, lifetime: number) {
  return Math.floor((amountLei / LEI_PER_HALO) * tierFor(lifetime).tier.multiplier);
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function credit(
  tx: Tx,
  userId: string,
  delta: number,
  kind: (typeof schema.ledgerKindEnum.enumValues)[number],
  extra: { note?: string; amountLei?: number; staffId?: string } = {},
) {
  const earning = delta > 0 && kind !== "refund" && kind !== "adjust";
  await tx
    .update(schema.users)
    .set({
      halos: sql`${schema.users.halos} + ${delta}`,
      ...(earning ? { halosLifetime: sql`${schema.users.halosLifetime} + ${delta}` } : {}),
    })
    .where(eq(schema.users.id, userId));
  await tx.insert(schema.ledger).values({ userId, delta, kind, ...extra });
}

export async function grantWelcome(userId: string) {
  await db.transaction((tx) => credit(tx, userId, WELCOME_HALOS, "welcome"));
}

/** Staff scan at the till: halos for the amount spent, plus coffee stamps. */
export async function awardPurchase(opts: {
  userId: string;
  amountLei: number;
  coffees: number;
  staffId: string;
}) {
  return db.transaction(async (tx) => {
    const [user] = await tx
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, opts.userId))
      .for("update");
    if (!user) throw new Error("member-not-found");

    const halos = halosForPurchase(opts.amountLei, user.halosLifetime);
    if (halos > 0) {
      await credit(tx, user.id, halos, "purchase", {
        amountLei: opts.amountLei,
        staffId: opts.staffId,
      });
    }

    let stamps = user.stamps + Math.max(0, opts.coffees);
    let freeCoffees = 0;
    while (stamps >= STAMPS_FOR_FREE_COFFEE) {
      stamps -= STAMPS_FOR_FREE_COFFEE;
      freeCoffees++;
    }
    await tx.update(schema.users).set({ stamps }).where(eq(schema.users.id, user.id));
    for (let i = 0; i < freeCoffees; i++) {
      await tx.insert(schema.redemptions).values({
        userId: user.id,
        label: "Cafea gratuită / Бесплатный кофе",
        cost: 0,
        code: randomCode(6),
      });
    }
    return { halos, stamps, freeCoffees };
  });
}

export async function redeemReward(userId: string, rewardId: string) {
  return db.transaction(async (tx) => {
    const [reward] = await tx
      .select()
      .from(schema.rewards)
      .where(and(eq(schema.rewards.id, rewardId), eq(schema.rewards.active, true)));
    if (!reward) return { ok: false as const, error: "reward" };
    const [user] = await tx
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .for("update");
    if (!user || user.halos < reward.cost) return { ok: false as const, error: "balance" };

    await credit(tx, userId, -reward.cost, "redeem", { note: reward.nameRo });
    const code = randomCode(6);
    await tx.insert(schema.redemptions).values({
      userId,
      rewardId: reward.id,
      label: `${reward.nameRo} / ${reward.nameRu}`,
      cost: reward.cost,
      code,
    });
    return { ok: true as const, code };
  });
}

export type ClaimResult =
  | { ok: true; halos: number; title: { ro: string; ru: string } }
  | { ok: false; error: "invalid" | "expired" | "already" | "full" };

export async function claimQr(userId: string, rawCode: string): Promise<ClaimResult> {
  const code = rawCode.trim().toUpperCase();
  return db.transaction(async (tx) => {
    const [drop] = await tx
      .select()
      .from(schema.qrDrops)
      .where(eq(schema.qrDrops.code, code))
      .for("update");
    if (!drop) return { ok: false, error: "invalid" };
    const now = new Date();
    if (!drop.active || (drop.startsAt && drop.startsAt > now) || (drop.endsAt && drop.endsAt < now)) {
      return { ok: false, error: "expired" };
    }
    if (drop.maxClaims != null) {
      const [{ count }] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.qrClaims)
        .where(eq(schema.qrClaims.qrId, drop.id));
      if (count >= drop.maxClaims) return { ok: false, error: "full" };
    }
    const inserted = await tx
      .insert(schema.qrClaims)
      .values({ qrId: drop.id, userId })
      .onConflictDoNothing()
      .returning();
    if (inserted.length === 0) return { ok: false, error: "already" };
    await credit(tx, userId, drop.halos, "qr", { note: drop.titleRo });
    return { ok: true, halos: drop.halos, title: { ro: drop.titleRo, ru: drop.titleRu } };
  });
}

/** Awards the yearly birthday gift the first time the member shows up on their birthday (Chișinău date). */
export async function maybeBirthdayBonus(user: typeof schema.users.$inferSelect) {
  if (!user.birthday) return false;
  const now = new Date();
  const [year, month, day] = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Chisinau" }).format(now).split("-").map(Number);
  const [, bMonth, bDay] = user.birthday.split("-").map(Number);
  if (bMonth !== month || bDay !== day) return false;
  if (user.lastBirthdayYear === year) return false;
  if (now.getTime() - user.createdAt.getTime() < BIRTHDAY_MIN_MEMBER_DAYS * 864e5) return false;
  return db.transaction(async (tx) => {
    // Conditional claim of the year: two tabs loading /account at once must not both pay out.
    const claimed = await tx
      .update(schema.users)
      .set({ lastBirthdayYear: year })
      .where(and(eq(schema.users.id, user.id), sql`${schema.users.lastBirthdayYear} is distinct from ${year}`))
      .returning({ id: schema.users.id });
    if (!claimed.length) return false;
    await credit(tx, user.id, BIRTHDAY_HALOS, "birthday");
    return true;
  });
}

export async function consumeVoucher(code: string, staffId: string) {
  const [row] = await db
    .update(schema.redemptions)
    .set({ status: "used", usedAt: new Date(), staffId })
    .where(and(eq(schema.redemptions.code, code), eq(schema.redemptions.status, "pending")))
    .returning();
  return row ?? null;
}
