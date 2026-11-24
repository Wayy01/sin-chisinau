"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleNotch, Copy, Trash, UploadSimple } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/client";
import { deleteMedia } from "@/lib/admin/actions";
import { uploadFiles } from "./MediaPicker";
import { cn } from "@/lib/cn";

type Row = { id: string; url: string; name: string; mime: string; size: number };

export function MediaManager({ rows }: { rows: Row[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [pending, start] = useTransition();

  const upload = (files: FileList | File[]) =>
    start(async () => {
      try {
        const saved = await uploadFiles(files);
        toast.success(`${saved.length} ✓`);
        router.refresh();
      } catch (e) {
        toast.error((e as Error).message);
      }
    });

  return (
    <>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          if (e.dataTransfer.files.length) upload(e.dataTransfer.files);
        }}
        onClick={() => input.current?.click()}
        className={cn(
          "grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors",
          over ? "border-gilt bg-gilt/10" : "border-ink/20 hover:border-ink/40",
        )}
      >
        {pending ? <CircleNotch size={32} className="animate-spin text-gilt" /> : <UploadSimple size={32} weight="light" className="text-gilt" />}
        <p className="mt-3 font-display text-2xl">{pending ? t.admin.media.uploading : t.admin.media.drop}</p>
        <p className="mt-1 font-mono text-[11px] text-ink-soft">JPG · PNG · WEBP · AVIF · MP4 · WEBM</p>
        <input
          ref={input}
          type="file"
          multiple
          accept="image/*,video/mp4,video/webm"
          className="hidden"
          onChange={(e) => e.target.files?.length && upload(e.target.files)}
        />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {rows.map((m) => (
          <figure key={m.id} className="group overflow-hidden rounded-2xl border border-ink/10 bg-milk">
            <div className="aspect-square overflow-hidden bg-paper-2">
              {m.mime.startsWith("video") ? (
                <video src={m.url} muted loop playsInline onMouseEnter={(e) => e.currentTarget.play()} onMouseLeave={(e) => e.currentTarget.pause()} className="h-full w-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt="" loading="lazy" className="h-full w-full object-cover" />
              )}
            </div>
            <figcaption className="flex items-center gap-1 p-2">
              <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-ink-soft" title={m.name}>
                {m.name} · {(m.size / 1024 / 1024).toFixed(1)} MB
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(m.url);
                  toast.success(t.common.copied);
                }}
                className="grid size-8 place-items-center rounded-full hover:bg-ink/5"
                aria-label={t.common.copy}
              >
                <Copy size={14} />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!window.confirm(t.admin.confirmDelete)) return;
                  start(async () => {
                    await deleteMedia(m.id);
                    router.refresh();
                  });
                }}
                className="grid size-8 place-items-center rounded-full text-cherry hover:bg-cherry/10"
                aria-label={t.common.delete}
              >
                <Trash size={14} />
              </button>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
