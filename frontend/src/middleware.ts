import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/register"];
const SUPPORTED_LOCALES = ["pt-BR", "en"];
const DEFAULT_LOCALE = "pt-BR";

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return true;
  // Public player registration: /[slug]/addPlayer
  if (pathname.match(/^\/[^/]+\/addPlayer$/)) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("refresh_token")?.value;
  const { pathname } = request.nextUrl;

  const isPublic = isPublicPath(pathname);
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  // Auth routing
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Locale: ensure NEXT_LOCALE cookie exists
  const response = NextResponse.next();
  const localeCookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (!localeCookie || !SUPPORTED_LOCALES.includes(localeCookie)) {
    response.cookies.set("NEXT_LOCALE", DEFAULT_LOCALE, { path: "/" });
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
