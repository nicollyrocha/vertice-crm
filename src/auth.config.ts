import type { NextAuthConfig } from "next-auth"

/**
 * Config compartilhada e sem dependência de banco. Usada diretamente pelo proxy
 * (só decodifica o JWT) e estendida em src/auth.ts com adapter e providers.
 */
export const authConfig = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  trustHost: true,
  pages: { signIn: "/login", error: "/login" },
  providers: [],
  callbacks: {
    session({ session, token }) {
      if (token.uid) session.user.id = token.uid as string
      return session
    },
  },
} satisfies NextAuthConfig
