import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  // NextAuth v5 uses "authjs.session-token" (or __Secure- prefix over HTTPS)
  const isSecure = req.url.startsWith("https://");
  const cookieName = isSecure
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
    cookieName,
  });

  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url)
      );
    }
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  } else if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
