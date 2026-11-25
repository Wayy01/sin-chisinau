import "server-only";
import { headers } from "next/headers";

/** Fixed-window counters in process memory: enough for the single `next start` process that serves SIN. */
const windows = new Map<string, { count: number; resetAt: number }>();

function bucket(key: string, windowMs: number) {
  const now = Date.now();
  let entry = windows.get(key);
  if (!entry || entry.resetAt <= now) {
    if (windows.size > 10_000) for (const [k, v] of windows) if (v.resetAt <= now) windows.delete(k);
    entry = { count: 0, resetAt: now + windowMs };
    windows.set(key, entry);
  }
  return entry;
}

export function isLimited(key: string, max: number, windowMs: number) {
  return bucket(key, windowMs).count >= max;
}

export function hit(key: string, windowMs: number) {
  bucket(key, windowMs).count++;
}

export function clear(key: string) {
  windows.delete(key);
}

/** Visitor IP as reported by the proxy in front of the app, or null when none is forwarded. */
export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
}
