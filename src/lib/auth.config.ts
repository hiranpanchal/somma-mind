import type { NextAuthConfig } from "next-auth";

// Edge-compatible auth config (no database imports)
export const authConfig: NextAuthConfig = {
  providers: [], // providers added in auth.ts (Node.js only)
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) return Response.redirect(new URL("/login", nextUrl));
        if (auth?.user?.role !== "ADMIN") return Response.redirect(new URL("/dashboard", nextUrl));
        return true;
      }
      if (pathname.startsWith("/dashboard")) {
        if (!isLoggedIn) return Response.redirect(new URL("/login", nextUrl));
        return true;
      }
      return true;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  trustHost: true,
};
