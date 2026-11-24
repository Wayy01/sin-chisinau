import "server-only";
import { locale as rootLocale } from "next/root-params";
import ro from "./dictionaries/ro";
import ru from "./dictionaries/ru";
import { defaultLocale, isLocale, type Locale } from "./config";

const dictionaries = { ro, ru };

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

/** Current locale from the [locale] root segment, usable in any server component. */
export async function getLocale(): Promise<Locale> {
  const value = await rootLocale();
  return isLocale(value) ? value : defaultLocale;
}

export async function getT() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}
