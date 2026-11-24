import {
  pgSchema,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// Everything lives in its own schema so the shared database stays clean.
export const sin = pgSchema("sin");

export const roleEnum = sin.enum("role", ["member", "staff", "admin"]);
export const ledgerKindEnum = sin.enum("ledger_kind", [
  "welcome",
  "purchase",
  "qr",
  "birthday",
  "redeem",
  "refund",
  "adjust",
]);
export const redemptionStatusEnum = sin.enum("redemption_status", [
  "pending",
  "used",
  "cancelled",
]);

export const users = sin.table(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    phone: text("phone"),
    birthday: date("birthday"),
    role: roleEnum("role").notNull().default("member"),
    memberCode: text("member_code").notNull(),
    halos: integer("halos").notNull().default(0),
    halosLifetime: integer("halos_lifetime").notNull().default(0),
    stamps: integer("stamps").notNull().default(0),
    locale: text("locale").notNull().default("ro"),
    lastBirthdayYear: integer("last_birthday_year"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("users_email_idx").on(t.email),
    uniqueIndex("users_member_code_idx").on(t.memberCode),
  ],
);

export const sessions = sin.table(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const categories = sin.table("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  nameRo: text("name_ro").notNull(),
  nameRu: text("name_ru").notNull(),
  blurbRo: text("blurb_ro"),
  blurbRu: text("blurb_ru"),
  image: text("image"),
  sort: integer("sort").notNull().default(0),
});

export const menuItems = sin.table(
  "menu_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    slug: text("slug").notNull().unique(),
    nameRo: text("name_ro").notNull(),
    nameRu: text("name_ru").notNull(),
    descRo: text("desc_ro"),
    descRu: text("desc_ru"),
    price: integer("price").notNull(),
    portion: text("portion"),
    image: text("image"),
    tags: text("tags").array().notNull().default([]),
    available: boolean("available").notNull().default(true),
    featured: boolean("featured").notNull().default(false),
    sort: integer("sort").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("menu_items_category_idx").on(t.categoryId)],
);

export const posts = sin.table("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  titleRo: text("title_ro").notNull(),
  titleRu: text("title_ru").notNull(),
  excerptRo: text("excerpt_ro"),
  excerptRu: text("excerpt_ru"),
  bodyRo: text("body_ro").notNull().default(""),
  bodyRu: text("body_ru").notNull().default(""),
  cover: text("cover"),
  video: text("video"),
  published: boolean("published").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const media = sin.table("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  name: text("name").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  alt: text("alt"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rewards = sin.table("rewards", {
  id: uuid("id").primaryKey().defaultRandom(),
  nameRo: text("name_ro").notNull(),
  nameRu: text("name_ru").notNull(),
  descRo: text("desc_ro"),
  descRu: text("desc_ru"),
  cost: integer("cost").notNull(),
  image: text("image"),
  active: boolean("active").notNull().default(true),
  sort: integer("sort").notNull().default(0),
});

export const redemptions = sin.table(
  "redemptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rewardId: uuid("reward_id").references(() => rewards.id, { onDelete: "set null" }),
    label: text("label").notNull(),
    cost: integer("cost").notNull(),
    code: text("code").notNull(),
    status: redemptionStatusEnum("status").notNull().default("pending"),
    staffId: uuid("staff_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    usedAt: timestamp("used_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("redemptions_code_idx").on(t.code), index("redemptions_user_idx").on(t.userId)],
);

export const qrDrops = sin.table(
  "qr_drops",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull(),
    titleRo: text("title_ro").notNull(),
    titleRu: text("title_ru").notNull(),
    halos: integer("halos").notNull(),
    maxClaims: integer("max_claims"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("qr_drops_code_idx").on(t.code)],
);

export const qrClaims = sin.table(
  "qr_claims",
  {
    qrId: uuid("qr_id")
      .notNull()
      .references(() => qrDrops.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.qrId, t.userId] })],
);

export const ledger = sin.table(
  "ledger",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: ledgerKindEnum("kind").notNull(),
    delta: integer("delta").notNull(),
    amountLei: integer("amount_lei"),
    note: text("note"),
    staffId: uuid("staff_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ledger_user_idx").on(t.userId, t.createdAt)],
);

export const favorites = sin.table(
  "favorites",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    itemId: uuid("item_id")
      .notNull()
      .references(() => menuItems.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.itemId] })],
);

export const settings = sin.table("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
});

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Reward = typeof rewards.$inferSelect;
export type QrDrop = typeof qrDrops.$inferSelect;
export type Media = typeof media.$inferSelect;
