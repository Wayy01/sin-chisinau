import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Reuse one pool across dev hot-reloads.
const globalForDb = globalThis as unknown as { sinSql?: ReturnType<typeof postgres> };

const sql =
  globalForDb.sinSql ??
  postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 30, prepare: false });

if (process.env.NODE_ENV !== "production") globalForDb.sinSql = sql;

export const db = drizzle(sql, { schema });
export { schema };
