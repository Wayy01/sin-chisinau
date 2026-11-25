import { Suspense } from "react";
import { getT } from "@/lib/i18n/server";
import { getSettings } from "@/lib/data";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { AccountChip, AccountChipFallback } from "@/components/site/AccountChip";
import { Preloader } from "@/components/motion/Preloader";
import { Grain } from "@/components/art/Grain";

export default async function SiteLayout({ children }: LayoutProps<"/[locale]">) {
  const [{ locale, t }, settings] = await Promise.all([getT(), getSettings()]);
  const announcement = locale === "ro" ? settings.announcementRo : settings.announcementRu;

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
        {t.nav.skip}
      </a>
      <Preloader tagline={t.footer.tagline} />
      <Header
        announcement={announcement}
        account={
          <Suspense fallback={<AccountChipFallback />}>
            <AccountChip />
          </Suspense>
        }
      />
      <main id="main" className="overflow-x-clip">
        {children}
      </main>
      <Footer />
      <Grain />
    </>
  );
}
