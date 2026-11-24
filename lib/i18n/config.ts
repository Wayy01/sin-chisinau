export const locales = ["ro", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ro";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export const intlLocale: Record<Locale, string> = { ro: "ro-MD", ru: "ru-MD" };

/** Pick the ro/ru variant of a bilingual DB row field, e.g. pick(item, "name", "ru"). */
export function pick<T extends Record<string, unknown>, K extends string>(
  row: T,
  field: K,
  locale: Locale,
): string {
  const key = `${field}${locale === "ro" ? "Ro" : "Ru"}`;
  const fallback = `${field}Ro`;
  return ((row[key] as string | null) || (row[fallback] as string | null) || "") as string;
}

export function plural(
  locale: Locale,
  n: number,
  forms: { one: string; few: string; many?: string; other: string },
) {
  const rule = new Intl.PluralRules(intlLocale[locale]).select(n);
  if (rule === "one") return forms.one;
  if (rule === "few") return forms.few;
  if (rule === "many") return forms.many ?? forms.other;
  return forms.other;
}

export function formatDate(date: Date | string, locale: Locale, opts?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(
    intlLocale[locale],
    opts ?? { day: "numeric", month: "long", year: "numeric" },
  ).format(typeof date === "string" ? new Date(date) : date);
}
