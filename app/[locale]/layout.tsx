import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";
import "../globals.css";
import { fontVariables } from "@/lib/fonts";
import { locales, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/client";
import { InkDefs } from "@/components/art/InkDefs";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { TransitionProvider } from "@/components/motion/PageTransition";
import { Cursor } from "@/components/motion/Cursor";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    metadataBase: process.env.SITE_URL ? new URL(process.env.SITE_URL) : undefined,
    title: { default: t.meta.title, template: "%s · SIN" },
    description: t.meta.description,
    alternates: { languages: { ro: "/ro", ru: "/ru" } },
    icons: { icon: "/favicon.svg" },
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      images: ["/media/img/bag-logo.webp"],
      locale: locale === "ro" ? "ro_MD" : "ru_MD",
      type: "website",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#f3eadc",
};

// Runs before paint so the intro never flashes for visitors who've already seen it.
const introScript = `try{if(sessionStorage.getItem('sin_intro'))document.documentElement.dataset.intro='seen'}catch(e){}`;

export default async function RootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body className="min-h-dvh antialiased">
        <InkDefs />
        <I18nProvider locale={locale} t={t}>
          <TransitionProvider>
            <SmoothScroll>{children}</SmoothScroll>
            <Cursor />
          </TransitionProvider>
        </I18nProvider>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "var(--color-ink)",
              color: "var(--color-paper)",
              border: "1px solid color-mix(in oklab, var(--color-gilt) 40%, transparent)",
              borderRadius: "999px",
              fontFamily: "var(--font-sans)",
            },
          }}
        />
      </body>
    </html>
  );
}
