import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { MIME, UPLOAD_ROOT } from "@/lib/admin/media";

export async function GET(request: Request, { params }: RouteContext<"/uploads/[...path]">) {
  const { path: parts } = await params;
  const file = path.resolve(UPLOAD_ROOT, ...parts);
  if (!file.startsWith(UPLOAD_ROOT + path.sep)) return new Response("Not found", { status: 404 });

  const info = await stat(file).catch(() => null);
  if (!info?.isFile()) return new Response("Not found", { status: 404 });

  const headers = new Headers({
    "Content-Type": MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream",
    "Cache-Control": "public, max-age=31536000, immutable",
    "Accept-Ranges": "bytes",
    // An uploaded SVG opened directly would otherwise run its scripts with the site's cookies.
    "Content-Security-Policy": "default-src 'none'; img-src 'self' data:; media-src 'self'; style-src 'unsafe-inline'; sandbox",
    "X-Content-Type-Options": "nosniff",
  });

  const range = request.headers.get("range")?.match(/bytes=(\d*)-(\d*)/);
  if (range) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Math.min(Number(range[2]), info.size - 1) : info.size - 1;
    if (start > end || start >= info.size) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${info.size}` } });
    }
    headers.set("Content-Range", `bytes ${start}-${end}/${info.size}`);
    headers.set("Content-Length", String(end - start + 1));
    return new Response(Readable.toWeb(createReadStream(file, { start, end })) as ReadableStream, { status: 206, headers });
  }

  headers.set("Content-Length", String(info.size));
  return new Response(Readable.toWeb(createReadStream(file)) as ReadableStream, { headers });
}
