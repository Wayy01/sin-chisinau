import type { Category, MenuItem } from "@/db/schema";
import type { Dictionary } from "@/lib/i18n/dictionaries/ro";
import { saveItem } from "@/lib/admin/actions";
import { AdminForm, SubmitButton } from "./AdminForm";
import { Area, Card, Check, Field, Select, Label } from "./fields";
import { MediaPicker } from "./MediaPicker";

const TAGS = ["signature", "new", "seasonal", "vegetarian"] as const;

export function ItemForm({ item, categories, t }: { item?: MenuItem; categories: Category[]; t: Dictionary }) {
  const f = t.admin.fields;
  return (
    <AdminForm action={saveItem} className="grid gap-6 xl:grid-cols-3">
      {item && <input type="hidden" name="id" value={item.id} />}
      <div className="space-y-6 xl:col-span-2">
        <Card>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label={f.nameRo} name="nameRo" defaultValue={item?.nameRo} required />
            <Field label={f.nameRu} name="nameRu" defaultValue={item?.nameRu} required />
            <Area label={f.descRo} name="descRo" defaultValue={item?.descRo ?? ""} />
            <Area label={f.descRu} name="descRu" defaultValue={item?.descRu ?? ""} />
          </div>
        </Card>
        <Card>
          <div className="grid gap-5 md:grid-cols-3">
            <Field label={f.price} name="price" type="number" min={0} defaultValue={item?.price} required />
            <Field label={f.portion} name="portion" defaultValue={item?.portion ?? ""} placeholder="120 g · 300 ml" />
            <Field label={f.sort} name="sort" type="number" defaultValue={item?.sort ?? 0} />
            <Select label={f.category} name="categoryId" defaultValue={item?.categoryId} required className="md:col-span-2">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameRo} · {c.nameRu}
                </option>
              ))}
            </Select>
            <Field label={f.slug} name="slug" defaultValue={item?.slug} placeholder="auto" />
          </div>
          <div className="mt-6">
            <Label>{f.tags}</Label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <label key={tag} className="cursor-pointer">
                  <input type="checkbox" name="tags" value={tag} defaultChecked={item?.tags.includes(tag)} className="peer sr-only" />
                  <span className="block rounded-full border border-ink/15 px-4 py-2 text-sm transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper">
                    {t.common[tag]}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <MediaPicker name="image" label={f.image} defaultValue={item?.image} />
        </Card>
        <Card>
          <div className="space-y-4">
            <Check label={f.available} name="available" defaultChecked={item?.available ?? true} />
            <Check label={f.featured} name="featured" defaultChecked={item?.featured ?? false} />
          </div>
        </Card>
        <SubmitButton className="w-full btn-lg" />
      </div>
    </AdminForm>
  );
}
