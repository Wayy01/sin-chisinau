import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";

function preferredLocale(request: NextRequest): Locale {
  const saved = request.cookies.get("sin_locale")?.value;
  if (isLocale(saved)) return saved;
  const accept = request.headers.get("accept-language")?.toLowerCase() ?? "";
  // Russian speakers get ru unless they also list Romanian first.
  const ruAt = accept.indexOf("ru");
  const roAt = accept.indexOf("ro");
  if (ruAt !== -1 && (roAt === -1 || ruAt < roAt)) return "ru";
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];
  if (isLocale(first)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|uploads|media|_next|favicon.ico|icon|apple-icon|robots.txt|sitemap.xml|.*\\.[\\w]+$).*)"],
};
