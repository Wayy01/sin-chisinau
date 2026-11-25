"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { CircleNotch, ImageSquare, Trash, UploadSimple, X } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/client";
import { listMedia, type LibraryFile } from "@/lib/admin/actions";
import { Label } from "./fields";
import { cn } from "@/lib/cn";

export async function uploadFiles(files: FileList | File[]) {
  const body = new FormData();
  Array.from(files).forEach((f) => body.append("files", f));
  const res = await fetch("/api/upload", { method: "POST", body });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? res.statusText);
  return (await res.json()).media as { url: string }[];
}

export function MediaPicker({
  name,
  label,
  defaultValue,
  kind = "image",
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  kind?: "image" | "video";
}) {
  const { t } = useI18n();
  const [value, setValue] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Label>{label}</Label>
      <input type="hidden" name={name} value={value} />
      <div className="flex items-center gap-4 rounded-xl border border-ink/12 bg-milk p-3">
        <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-paper-2">
          {value ? (
            kind === "video" ? (
              <video src={value} muted className="h-full w-full object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="" className="h-full w-full object-cover" />
            )
          ) : (
            <ImageSquare size={24} weight="light" className="text-ink/30" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-xs text-ink-soft">{value || t.admin.media.none}</p>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => setOpen(true)} className="btn btn-line btn-sm min-w-0 whitespace-normal text-center leading-tight">
              {t.admin.media.pick}
            </button>
            {value && (
              <button type="button" onClick={() => setValue("")} className="grid size-9 place-items-center rounded-full text-cherry hover:bg-cherry/10" aria-label={t.common.delete}>
                <Trash size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
      {open && (
        <PickerDialog
          kind={kind}
          onClose={() => setOpen(false)}
          onPick={(url) => {
            setValue(url);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function PickerDialog({ kind, onClose, onPick }: { kind: "image" | "video"; onClose: () => void; onPick: (url: string) => void }) {
  const { t } = useI18n();
  const [data, setData] = useState<{ uploads: LibraryFile[]; library: LibraryFile[] } | null>(null);
  const [tab, setTab] = useState<"uploads" | "library">("library");
  const [pending, start] = useTransition();
  const input = useRef<HTMLInputElement>(null);

  const load = () => start(async () => setData(await listMedia()));
  useEffect(load, []);

  const files = (data?.[tab] ?? []).filter((f) => f.kind === kind);

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-night/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[85dvh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-paper shadow-2xl">
        <div className="flex items-center gap-3 border-b border-ink/10 p-4">
          {(["library", "uploads"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={cn("rounded-full px-4 py-2 text-sm", tab === k ? "bg-ink text-paper" : "text-ink-soft hover:bg-ink/5")}
            >
              {k === "library" ? "SIN library" : t.admin.nav.media}
            </button>
          ))}
          <button type="button" onClick={() => input.current?.click()} className="btn btn-sm ml-auto">
            {pending ? <CircleNotch size={14} className="animate-spin" /> : <UploadSimple size={14} />}
            {t.admin.media.upload}
          </button>
          <input
            ref={input}
            type="file"
            multiple
            accept={kind === "video" ? "video/mp4,video/webm" : "image/*"}
            className="hidden"
            onChange={(e) => {
              const list = e.target.files;
              if (!list?.length) return;
              start(async () => {
                try {
                  await uploadFiles(list);
                  setTab("uploads");
                  setData(await listMedia());
                } catch (err) {
                  toast.error((err as Error).message);
                }
              });
            }}
          />
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full hover:bg-ink/5" aria-label={t.nav.close}>
            <X size={18} />
          </button>
        </div>
        <div className="grid flex-1 grid-cols-3 gap-3 overflow-y-auto p-4 sm:grid-cols-4 md:grid-cols-5" data-lenis-prevent>
          {!data && <p className="col-span-full py-16 text-center text-ink-soft">{t.common.loading}</p>}
          {data && files.length === 0 && <p className="col-span-full py-16 text-center text-ink-soft">{t.admin.media.drop}</p>}
          {files.map((f) => (
            <button key={f.url} type="button" onClick={() => onPick(f.url)} className="group overflow-hidden rounded-xl border border-ink/10 bg-milk text-left">
              <div className="aspect-square overflow-hidden bg-paper-2">
                {f.kind === "video" ? (
                  <video src={f.url} muted className="h-full w-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                )}
              </div>
              <p className="truncate px-2 py-1.5 font-mono text-[10px] text-ink-soft">{f.name}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
