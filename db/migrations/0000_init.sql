CREATE SCHEMA "sin";
--> statement-breakpoint
CREATE TYPE "sin"."ledger_kind" AS ENUM('welcome', 'purchase', 'qr', 'birthday', 'redeem', 'refund', 'adjust');--> statement-breakpoint
CREATE TYPE "sin"."redemption_status" AS ENUM('pending', 'used', 'cancelled');--> statement-breakpoint
CREATE TYPE "sin"."role" AS ENUM('member', 'staff', 'admin');--> statement-breakpoint
CREATE TABLE "sin"."categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name_ro" text NOT NULL,
	"name_ru" text NOT NULL,
	"blurb_ro" text,
	"blurb_ru" text,
	"image" text,
	"sort" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sin"."favorites" (
	"user_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	CONSTRAINT "favorites_user_id_item_id_pk" PRIMARY KEY("user_id","item_id")
);
--> statement-breakpoint
CREATE TABLE "sin"."ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"kind" "sin"."ledger_kind" NOT NULL,
	"delta" integer NOT NULL,
	"amount_lei" integer,
	"note" text,
	"staff_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sin"."media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"name" text NOT NULL,
	"mime" text NOT NULL,
	"size" integer NOT NULL,
	"alt" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sin"."menu_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"name_ro" text NOT NULL,
	"name_ru" text NOT NULL,
	"desc_ro" text,
	"desc_ru" text,
	"price" integer NOT NULL,
	"portion" text,
	"image" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"available" boolean DEFAULT true NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "menu_items_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sin"."posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title_ro" text NOT NULL,
	"title_ru" text NOT NULL,
	"excerpt_ro" text,
	"excerpt_ru" text,
	"body_ro" text DEFAULT '' NOT NULL,
	"body_ru" text DEFAULT '' NOT NULL,
	"cover" text,
	"video" text,
	"published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sin"."qr_claims" (
	"qr_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "qr_claims_qr_id_user_id_pk" PRIMARY KEY("qr_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "sin"."qr_drops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"title_ro" text NOT NULL,
	"title_ru" text NOT NULL,
	"halos" integer NOT NULL,
	"max_claims" integer,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sin"."redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"reward_id" uuid,
	"label" text NOT NULL,
	"cost" integer NOT NULL,
	"code" text NOT NULL,
	"status" "sin"."redemption_status" DEFAULT 'pending' NOT NULL,
	"staff_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"used_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sin"."rewards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_ro" text NOT NULL,
	"name_ru" text NOT NULL,
	"desc_ro" text,
	"desc_ru" text,
	"cost" integer NOT NULL,
	"image" text,
	"active" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sin"."sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sin"."settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sin"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"birthday" date,
	"role" "sin"."role" DEFAULT 'member' NOT NULL,
	"member_code" text NOT NULL,
	"halos" integer DEFAULT 0 NOT NULL,
	"halos_lifetime" integer DEFAULT 0 NOT NULL,
	"stamps" integer DEFAULT 0 NOT NULL,
	"locale" text DEFAULT 'ro' NOT NULL,
	"last_birthday_year" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sin"."favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "sin"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sin"."favorites" ADD CONSTRAINT "favorites_item_id_menu_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "sin"."menu_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sin"."ledger" ADD CONSTRAINT "ledger_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "sin"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sin"."ledger" ADD CONSTRAINT "ledger_staff_id_users_id_fk" FOREIGN KEY ("staff_id") REFERENCES "sin"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sin"."menu_items" ADD CONSTRAINT "menu_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "sin"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sin"."qr_claims" ADD CONSTRAINT "qr_claims_qr_id_qr_drops_id_fk" FOREIGN KEY ("qr_id") REFERENCES "sin"."qr_drops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sin"."qr_claims" ADD CONSTRAINT "qr_claims_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "sin"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sin"."redemptions" ADD CONSTRAINT "redemptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "sin"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sin"."redemptions" ADD CONSTRAINT "redemptions_reward_id_rewards_id_fk" FOREIGN KEY ("reward_id") REFERENCES "sin"."rewards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sin"."redemptions" ADD CONSTRAINT "redemptions_staff_id_users_id_fk" FOREIGN KEY ("staff_id") REFERENCES "sin"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sin"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "sin"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ledger_user_idx" ON "sin"."ledger" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "menu_items_category_idx" ON "sin"."menu_items" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "qr_drops_code_idx" ON "sin"."qr_drops" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "redemptions_code_idx" ON "sin"."redemptions" USING btree ("code");--> statement-breakpoint
CREATE INDEX "redemptions_user_idx" ON "sin"."redemptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sin"."sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "sin"."users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_member_code_idx" ON "sin"."users" USING btree ("member_code");