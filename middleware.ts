import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminCookieName, verifyAdminSessionToken } from "@/lib/adminAuth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow login endpoint + page
  if (pathname.startsWith("/admin/login") || pathname.startsWith("/api/admin/login")) {
    return NextResponse.next();
  }

  // Protect admin routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const cookieName = getAdminCookieName();
    const token = req.cookies.get(cookieName)?.value;
    const ok = verifyAdminSessionToken(token);

    if (!ok) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

