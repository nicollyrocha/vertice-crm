import NextAuth, { CredentialsSignin, type NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { eq } from "drizzle-orm"
import { authConfig } from "@/auth.config"
import { db, getDb } from "@/db"
import { accounts, sessions, users, verificationTokens } from "@/db/schema"
import { verifyPassword } from "@/lib/password"
import { signInSchema } from "@/lib/validations/auth"
import { rateLimit } from "@/server/rate-limit"

class InvalidCredentials extends CredentialsSignin {
  code = "invalid_credentials"
}
class TooManyAttempts extends CredentialsSignin {
  code = "rate_limited"
}

const providers: NextAuthConfig["providers"] = [
  Credentials({
    credentials: { email: {}, password: {} },
    async authorize(raw) {
      const parsed = signInSchema.safeParse(raw)
      if (!parsed.success) throw new InvalidCredentials()
      const { email, password } = parsed.data

      if (!(await rateLimit(`login:${email}`, 8, 60 * 15))) throw new TooManyAttempts()

      const user = await db.query.users.findFirst({ where: eq(users.email, email) })
      if (!user?.passwordHash) throw new InvalidCredentials()
      if (!(await verifyPassword(password, user.passwordHash))) throw new InvalidCredentials()

      return { id: user.id, name: user.name, email: user.email, image: user.image }
    },
  }),
]

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) providers.push(Google)
if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) providers.push(GitHub)

export const oauthProviders = {
  google: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
  github: Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET),
}

// Config lazy: o adapter recebe a instância real do Drizzle só quando há uma requisição.
export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth(() => ({
  adapter: process.env.DATABASE_URL ? DrizzleAdapter(getDb(), {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) : undefined,
  ...authConfig,
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      if (user?.id) token.uid = user.id
      if (trigger === "update" && token.uid) {
        const fresh = await db.query.users.findFirst({ where: eq(users.id, token.uid as string) })
        if (fresh) {
          token.name = fresh.name
          token.email = fresh.email
          token.picture = fresh.image
        }
      }
      return token
    },
  },
  events: {
    // Emails de OAuth já são verificados pelo provedor.
    async linkAccount({ user }) {
      if (user.id) await db.update(users).set({ emailVerified: new Date() }).where(eq(users.id, user.id))
    },
  },
}))
