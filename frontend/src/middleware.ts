import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/register"];

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

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
