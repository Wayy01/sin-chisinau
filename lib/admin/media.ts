import "server-only";
import path from "node:path";

export const UPLOAD_ROOT = path.join(process.cwd(), "storage", "uploads");

export const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

export const EXT_FOR_MIME = Object.fromEntries(Object.entries(MIME).map(([ext, mime]) => [mime, ext]));

export const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;
