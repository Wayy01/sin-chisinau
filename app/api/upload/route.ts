import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { db, schema } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { EXT_FOR_MIME, MAX_UPLOAD_BYTES, UPLOAD_ROOT } from "@/lib/admin/media";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return Response.json({ error: "forbidden" }, { status: 403 });

  const form = await request.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) return Response.json({ error: "no-files" }, { status: 400 });

  const now = new Date();
  const dir = path.join(String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, "0"));
  await mkdir(path.join(UPLOAD_ROOT, dir), { recursive: true });

  const saved = [];
  for (const file of files) {
    const ext = EXT_FOR_MIME[file.type];
    if (!ext || file.size > MAX_UPLOAD_BYTES) continue;
    const name = `${randomUUID()}${ext}`;
    await writeFile(path.join(UPLOAD_ROOT, dir, name), Buffer.from(await file.arrayBuffer()));
    const [row] = await db
      .insert(schema.media)
      .values({ url: `/uploads/${dir}/${name}`, name: file.name, mime: file.type, size: file.size })
      .returning();
    saved.push(row);
  }
  if (!saved.length) return Response.json({ error: "unsupported" }, { status: 415 });
  return Response.json({ media: saved });
}
