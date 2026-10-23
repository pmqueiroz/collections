import { type NextRequest, NextResponse } from "next/server";
import {
  hasLocale,
  LOCALE_COOKIE,
  localePath,
  matchLocale,
  pathLocale,
} from "./i18n/locales";

const RELIC_ASSET_PATH = /^\/relics\/[^/]+\/[^/]+\/?$/;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function preferredLocale(request: NextRequest) {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (hasLocale(saved)) return saved;
  return matchLocale(request.headers.get("accept-language"));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (RELIC_ASSET_PATH.test(pathname)) return;

  const current = pathLocale(pathname);
  if (current) {
    if (request.cookies.get(LOCALE_COOKIE)?.value === current) return;
    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE, current, {
      path: "/",
      maxAge: COOKIE_MAX_AGE,
      sameSite: "lax",
    });
    return response;
  }

  const url = request.nextUrl.clone();
  url.pathname = localePath(preferredLocale(request), pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/|.*\\.[^/]+$).*)"],
};
