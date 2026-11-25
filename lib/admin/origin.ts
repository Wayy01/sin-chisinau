import "server-only";
import { headers } from "next/headers";

/**
 * Origin baked into printed QR codes. SITE_URL wins, so cards printed from a laptop on localhost or the
 * tailnet still point at the public site; otherwise it is the host the admin is browsing on.
 */
export async function publicOrigin() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto.split(",")[0]}://${host.split(",")[0]}`;
}
