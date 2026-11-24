"use client";

import { useMemo, useState } from "react";
import { marked } from "marked";
import type { Post } from "@/db/schema";
import { useI18n } from "@/lib/i18n/client";
import { savePost } from "@/lib/admin/actions";
import { AdminForm, SubmitButton } from "./AdminForm";
import { Area, Card, Check, Field, Label } from "./fields";
import { MediaPicker } from "./MediaPicker";
import { cn } from "@/lib/cn";

type Lang = "ro" | "ru";

export function PostEditor({ post }: { post?: Post }) {
  const { t } = useI18n();
  const f = t.admin.fields;
  const [lang, setLang] = useState<Lang>("ro");
  const [preview, setPreview] = useState(false);
  const [body, setBody] = useState({ ro: post?.bodyRo ?? "", ru: post?.bodyRu ?? "" });
  const html = useMemo(() => (preview ? (marked.parse(body[lang]) as string) : ""), [preview, body, lang]);

  return (
    <AdminForm action={savePost} className="grid gap-6 xl:grid-cols-3">
      {post && <input type="hidden" name="id" value={post.id} />}
      <div className="xl:col-span-2">
        <Card>
          <div className="mb-6 flex gap-2">
            {(["ro", "ru"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={cn("rounded-full px-4 py-1.5 font-mono text-xs tracking-[0.18em] uppercase", lang === l ? "bg-ink text-paper" : "border border-ink/15")}
              >
                {l}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPreview((p) => !p)}
              className={cn("ml-auto rounded-full px-4 py-1.5 text-sm", preview ? "bg-gilt text-night" : "border border-ink/15")}
            >
              Preview
            </button>
          </div>

          {(["ro", "ru"] as const).map((l) => {
            const L = l === "ro" ? "Ro" : "Ru";
            return (
              <div key={l} className={cn("space-y-5", lang !== l && "hidden")}>
                <Field label={f[`title${L}`]} name={`title${L}`} defaultValue={post?.[`title${L}`]} required className="[&_input]:font-display [&_input]:text-2xl" />
                <Area label={f[`excerpt${L}`]} name={`excerpt${L}`} defaultValue={post?.[`excerpt${L}`] ?? ""} rows={2} />
                <div className={cn(preview && "hidden")}>
                  <Area
                    label={f[`body${L}`]}
                    name={`body${L}`}
                    value={body[l]}
                    onChange={(e) => setBody((b) => ({ ...b, [l]: e.target.value }))}
                    rows={18}
                    className="[&_textarea]:font-mono [&_textarea]:text-sm"
                  />
                </div>
                {preview && (
                  <>
                    <input type="hidden" name={`body${L}`} value={body[l]} />
                    <div>
                      <Label>{f[`body${L}`]}</Label>
                      <div className="prose-sin rounded-xl border border-ink/10 bg-paper p-6" dangerouslySetInnerHTML={{ __html: html }} />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <div className="space-y-5">
            <Check label={f.published} name="published" defaultChecked={post?.published ?? false} />
            <Field label={f.slug} name="slug" defaultValue={post?.slug} placeholder="auto" />
          </div>
        </Card>
        <Card>
          <div className="space-y-5">
            <MediaPicker name="cover" label={f.cover} defaultValue={post?.cover} />
            <MediaPicker name="video" label={f.video} defaultValue={post?.video} kind="video" />
          </div>
        </Card>
        <SubmitButton className="btn-lg w-full" />
      </div>
    </AdminForm>
  );
}
