"use server";

import { unlink } from "node:fs/promises";
import path from "node:path";
import { readdir } from "node:fs/promises";
import { updateTag } from "next/cache";
import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { TAGS, DEFAULT_SETTINGS, type SiteSettings } from "@/lib/data";
import { awardPurchase, consumeVoucher, LEI_PER_HALO, tierFor } from "@/lib/loyalty";
import { UPLOAD_ROOT } from "@/lib/admin/media";

export type Result = { ok: boolean; message?: string; redirect?: string } | null;

async function guard(role: "admin" | "staff" = "admin") {
  const user = await getCurrentUser();
  if (!user || user.role === "member" || (role === "admin" && user.role !== "admin")) {
    throw new Error("forbidden");
  }
  return user;
}

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");
const opt = (v: FormDataEntryValue | null) => str(v) || null;
const bool = (v: FormDataEntryValue | null) => v === "on" || v === "true";
const date = (v: FormDataEntryValue | null) => (str(v) ? new Date(str(v)) : null);

export async function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const fail = (err: unknown): Result => {
  const msg = err instanceof z.ZodError ? err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") : String((err as Error)?.message ?? err);
  if (/duplicate key|unique/i.test(msg)) return { ok: false, message: "slug/code already exists" };
  return { ok: false, message: msg };
};

/* ---------------- menu ---------------- */

const itemSchema = z.object({
  categoryId: z.uuid(),
  slug: z.string().min(1).max(80),
  nameRo: z.string().min(1),
  nameRu: z.string().min(1),
  descRo: z.string().nullable(),
  descRu: z.string().nullable(),
  price: z.number().int().min(0).max(100000),
  portion: z.string().nullable(),
  image: z.string().nullable(),
  tags: z.array(z.enum(["signature", "new", "seasonal", "vegetarian"])),
  available: z.boolean(),
  featured: z.boolean(),
  sort: z.number().int(),
});

export async function saveItem(_: Result, form: FormData): Promise<Result> {
  try {
    await guard();
    const id = opt(form.get("id"));
    const data = itemSchema.parse({
      categoryId: str(form.get("categoryId")),
      slug: str(form.get("slug")) || (await slugify(str(form.get("nameRo")))),
      nameRo: str(form.get("nameRo")),
      nameRu: str(form.get("nameRu")),
      descRo: opt(form.get("descRo")),
      descRu: opt(form.get("descRu")),
      price: Number(form.get("price")),
      portion: opt(form.get("portion")),
      image: opt(form.get("image")),
      tags: form.getAll("tags").map(String),
      available: bool(form.get("available")),
      featured: bool(form.get("featured")),
      sort: Number(form.get("sort") || 0),
    });
    if (id) await db.update(schema.menuItems).set(data).where(eq(schema.menuItems.id, id));
    else await db.insert(schema.menuItems).values(data);
    updateTag(TAGS.menu);
    return { ok: true, redirect: "menu" };
  } catch (e) {
    return fail(e);
  }
}

export async function toggleItem(id: string, field: "available" | "featured", value: boolean) {
  await guard();
  await db.update(schema.menuItems).set({ [field]: value }).where(eq(schema.menuItems.id, z.uuid().parse(id)));
  updateTag(TAGS.menu);
}

export async function deleteItem(id: string) {
  await guard();
  await db.delete(schema.menuItems).where(eq(schema.menuItems.id, z.uuid().parse(id)));
  updateTag(TAGS.menu);
}

const categorySchema = z.object({
  slug: z.string().min(1).max(60),
  nameRo: z.string().min(1),
  nameRu: z.string().min(1),
  blurbRo: z.string().nullable(),
  blurbRu: z.string().nullable(),
  image: z.string().nullable(),
  sort: z.number().int(),
});

export async function saveCategory(_: Result, form: FormData): Promise<Result> {
  try {
    await guard();
    const id = opt(form.get("id"));
    const data = categorySchema.parse({
      slug: str(form.get("slug")) || (await slugify(str(form.get("nameRo")))),
      nameRo: str(form.get("nameRo")),
      nameRu: str(form.get("nameRu")),
      blurbRo: opt(form.get("blurbRo")),
      blurbRu: opt(form.get("blurbRu")),
      image: opt(form.get("image")),
      sort: Number(form.get("sort") || 0),
    });
    if (id) await db.update(schema.categories).set(data).where(eq(schema.categories.id, id));
    else await db.insert(schema.categories).values(data);
    updateTag(TAGS.menu);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteCategory(id: string) {
  await guard();
  await db.delete(schema.categories).where(eq(schema.categories.id, z.uuid().parse(id)));
  updateTag(TAGS.menu);
}

/* ---------------- journal ---------------- */

const postSchema = z.object({
  slug: z.string().min(1).max(100),
  titleRo: z.string().min(1),
  titleRu: z.string().min(1),
  excerptRo: z.string().nullable(),
  excerptRu: z.string().nullable(),
  bodyRo: z.string(),
  bodyRu: z.string(),
  cover: z.string().nullable(),
  video: z.string().nullable(),
  published: z.boolean(),
});

export async function savePost(_: Result, form: FormData): Promise<Result> {
  try {
    await guard();
    const id = opt(form.get("id"));
    const data = postSchema.parse({
      slug: str(form.get("slug")) || (await slugify(str(form.get("titleRo")))),
      titleRo: str(form.get("titleRo")),
      titleRu: str(form.get("titleRu")),
      excerptRo: opt(form.get("excerptRo")),
      excerptRu: opt(form.get("excerptRu")),
      bodyRo: str(form.get("bodyRo")),
      bodyRu: str(form.get("bodyRu")),
      cover: opt(form.get("cover")),
      video: opt(form.get("video")),
      published: bool(form.get("published")),
    });
    const now = new Date();
    if (id) {
      const [current] = await db.select().from(schema.posts).where(eq(schema.posts.id, id));
      await db
        .update(schema.posts)
        .set({ ...data, updatedAt: now, publishedAt: data.published ? (current?.publishedAt ?? now) : current?.publishedAt })
        .where(eq(schema.posts.id, id));
    } else {
      await db.insert(schema.posts).values({ ...data, publishedAt: data.published ? now : null });
    }
    updateTag(TAGS.posts);
    return { ok: true, redirect: "journal" };
  } catch (e) {
    return fail(e);
  }
}

export async function deletePost(id: string) {
  await guard();
  await db.delete(schema.posts).where(eq(schema.posts.id, z.uuid().parse(id)));
  updateTag(TAGS.posts);
}

/* ---------------- media ---------------- */

export type LibraryFile = { url: string; name: string; kind: "image" | "video" };

export async function listMedia(): Promise<{ uploads: LibraryFile[]; library: LibraryFile[] }> {
  await guard();
  const rows = await db.select().from(schema.media).orderBy(desc(schema.media.createdAt));
  const uploads = rows.map((r) => ({ url: r.url, name: r.name, kind: r.mime.startsWith("video") ? ("video" as const) : ("image" as const) }));
  const library: LibraryFile[] = [];
  for (const dir of ["img", "art", "video"]) {
    const files = await readdir(path.join(process.cwd(), "public", "media", dir)).catch(() => []);
    for (const f of files) {
      if (dir === "video" && !f.endsWith(".mp4")) continue;
      library.push({ url: `/media/${dir}/${f}`, name: f, kind: dir === "video" ? "video" : "image" });
    }
  }
  return { uploads, library };
}

export async function deleteMedia(id: string) {
  await guard();
  const [row] = await db.delete(schema.media).where(eq(schema.media.id, z.uuid().parse(id))).returning();
  if (row?.url.startsWith("/uploads/")) {
    const file = path.resolve(UPLOAD_ROOT, row.url.replace(/^\/uploads\//, ""));
    if (file.startsWith(UPLOAD_ROOT + path.sep)) await unlink(file).catch(() => {});
  }
}

/* ---------------- rewards ---------------- */

const rewardSchema = z.object({
  nameRo: z.string().min(1),
  nameRu: z.string().min(1),
  descRo: z.string().nullable(),
  descRu: z.string().nullable(),
  cost: z.number().int().min(1),
  image: z.string().nullable(),
  active: z.boolean(),
  sort: z.number().int(),
});

export async function saveReward(_: Result, form: FormData): Promise<Result> {
  try {
    await guard();
    const id = opt(form.get("id"));
    const data = rewardSchema.parse({
      nameRo: str(form.get("nameRo")),
      nameRu: str(form.get("nameRu")),
      descRo: opt(form.get("descRo")),
      descRu: opt(form.get("descRu")),
      cost: Number(form.get("cost")),
      image: opt(form.get("image")),
      active: bool(form.get("active")),
      sort: Number(form.get("sort") || 0),
    });
    if (id) await db.update(schema.rewards).set(data).where(eq(schema.rewards.id, id));
    else await db.insert(schema.rewards).values(data);
    updateTag(TAGS.rewards);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteReward(id: string) {
  await guard();
  await db.delete(schema.rewards).where(eq(schema.rewards.id, z.uuid().parse(id)));
  updateTag(TAGS.rewards);
}

/* ---------------- QR drops ---------------- */

const qrSchema = z.object({
  code: z.string().min(2).max(40).regex(/^[A-Z0-9-]+$/, "A–Z, 0–9, -"),
  titleRo: z.string().min(1),
  titleRu: z.string().min(1),
  halos: z.number().int().min(1).max(10000),
  maxClaims: z.number().int().min(1).nullable(),
  startsAt: z.date().nullable(),
  endsAt: z.date().nullable(),
  active: z.boolean(),
});

export async function saveQr(_: Result, form: FormData): Promise<Result> {
  try {
    await guard();
    const id = opt(form.get("id"));
    const data = qrSchema.parse({
      code: str(form.get("code")).toUpperCase().replace(/\s+/g, "-"),
      titleRo: str(form.get("titleRo")),
      titleRu: str(form.get("titleRu")),
      halos: Number(form.get("halos")),
      maxClaims: str(form.get("maxClaims")) ? Number(form.get("maxClaims")) : null,
      startsAt: date(form.get("startsAt")),
      endsAt: date(form.get("endsAt")),
      active: bool(form.get("active")),
    });
    if (id) await db.update(schema.qrDrops).set(data).where(eq(schema.qrDrops.id, id));
    else await db.insert(schema.qrDrops).values(data);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteQr(id: string) {
  await guard();
  await db.delete(schema.qrDrops).where(eq(schema.qrDrops.id, z.uuid().parse(id)));
}

/* ---------------- members ---------------- */

export async function adjustHalos(_: Result, form: FormData): Promise<Result> {
  try {
    const staff = await guard();
    const userId = z.uuid().parse(str(form.get("userId")));
    const delta = z.number().int().refine((n) => n !== 0).parse(Number(form.get("delta")));
    const note = str(form.get("note")) || null;
    const ok = await db.transaction(async (tx) => {
      const [u] = await tx.select().from(schema.users).where(eq(schema.users.id, userId)).for("update");
      if (!u || u.halos + delta < 0) return false;
      await tx.update(schema.users).set({ halos: sql`${schema.users.halos} + ${delta}` }).where(eq(schema.users.id, userId));
      await tx.insert(schema.ledger).values({ userId, delta, kind: "adjust", note, staffId: staff.id });
      return true;
    });
    return ok ? { ok: true } : { ok: false, message: "balance < 0" };
  } catch (e) {
    return fail(e);
  }
}

export async function setRole(userId: string, role: "member" | "staff" | "admin") {
  const me = await guard();
  const id = z.uuid().parse(userId);
  if (id === me.id) throw new Error("cannot change own role");
  await db.update(schema.users).set({ role: z.enum(["member", "staff", "admin"]).parse(role) }).where(eq(schema.users.id, id));
}

/* ---------------- settings ---------------- */

export async function saveSettings(_: Result, form: FormData): Promise<Result> {
  try {
    await guard();
    const value = Object.fromEntries(
      (Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[]).map((k) => [k, str(form.get(k))]),
    ) as SiteSettings;
    await db
      .insert(schema.settings)
      .values({ key: "site", value })
      .onConflictDoUpdate({ target: schema.settings.key, set: { value } });
    updateTag(TAGS.settings);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/* ---------------- till scanner ---------------- */

export type Lookup =
  | {
      kind: "member";
      id: string;
      name: string;
      code: string;
      halos: number;
      stamps: number;
      lifetime: number;
      tier: "temptation" | "sinner" | "saint";
      multiplier: number;
      leiPerHalo: number;
    }
  | { kind: "voucher"; code: string; label: string; status: "pending" | "used" | "cancelled"; owner: string; usedAt: string | null }
  | { kind: "none" };

export async function lookupCode(raw: string): Promise<Lookup> {
  await guard("staff");
  const text = raw.trim().toUpperCase();
  const member = text.startsWith("SIN:M:") ? text.slice(6) : /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(text) ? text : null;
  const voucher = text.startsWith("SIN:R:") ? text.slice(6) : /^[A-Z0-9]{6}$/.test(text) ? text : null;

  if (member) {
    const [u] = await db.select().from(schema.users).where(eq(schema.users.memberCode, member));
    if (u) {
      const { tier } = tierFor(u.halosLifetime);
      return {
        kind: "member",
        id: u.id,
        name: u.name,
        code: u.memberCode,
        halos: u.halos,
        stamps: u.stamps,
        lifetime: u.halosLifetime,
        tier: tier.key,
        multiplier: tier.multiplier,
        leiPerHalo: LEI_PER_HALO,
      };
    }
  }
  if (voucher) {
    const [r] = await db
      .select({ r: schema.redemptions, owner: schema.users.name })
      .from(schema.redemptions)
      .innerJoin(schema.users, eq(schema.users.id, schema.redemptions.userId))
      .where(eq(schema.redemptions.code, voucher));
    if (r) {
      return { kind: "voucher", code: r.r.code, label: r.r.label, status: r.r.status, owner: r.owner, usedAt: r.r.usedAt?.toISOString() ?? null };
    }
  }
  return { kind: "none" };
}

export async function awardAtTill(memberId: string, amountLei: number, coffees: number) {
  const staff = await guard("staff");
  const amount = z.number().int().min(1).max(100000).parse(amountLei);
  const cups = z.number().int().min(0).max(50).parse(coffees);
  return awardPurchase({ userId: z.uuid().parse(memberId), amountLei: amount, coffees: cups, staffId: staff.id });
}

export async function redeemAtTill(code: string) {
  const staff = await guard("staff");
  const row = await consumeVoucher(z.string().length(6).parse(code.toUpperCase()), staff.id);
  return row ? { ok: true as const, label: row.label } : { ok: false as const };
}
