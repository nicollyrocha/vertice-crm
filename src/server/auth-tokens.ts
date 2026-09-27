import "server-only"
import { and, eq, gt, inArray, isNull } from "drizzle-orm"
import { db } from "@/db"
import { authTokens } from "@/db/schema"
import { addMinutes, createToken, hashToken } from "@/lib/tokens"

type TokenType = (typeof authTokens.$inferSelect)["type"]

/** Cria um token de uso único, invalidando os pendentes do mesmo tipo. Retorna o token em texto. */
export async function issueToken(
  userId: string,
  type: TokenType,
  ttlMinutes: number,
  payload?: { newEmail?: string },
) {
  const { token, hash } = createToken()
  const now = new Date()
  await db.batch([
    db
      .update(authTokens)
      .set({ usedAt: now })
      .where(and(eq(authTokens.userId, userId), eq(authTokens.type, type), isNull(authTokens.usedAt))),
    db.insert(authTokens).values({ userId, type, tokenHash: hash, payload, expiresAt: addMinutes(now, ttlMinutes) }),
  ])
  return token
}

/** Marca o token como usado atomicamente e o retorna, ou null se inválido/expirado/já usado. */
export async function consumeToken(token: string, types: TokenType[]) {
  const [row] = await db
    .update(authTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(authTokens.tokenHash, hashToken(token)),
        inArray(authTokens.type, types),
        isNull(authTokens.usedAt),
        gt(authTokens.expiresAt, new Date()),
      ),
    )
    .returning()
  return row ?? null
}
