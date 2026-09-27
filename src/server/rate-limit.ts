import "server-only"
import { sql } from "drizzle-orm"
import { db } from "@/db"
import { rateLimits } from "@/db/schema"

/**
 * Janela fixa no Postgres (atômico via upsert). Retorna `true` se a requisição é permitida.
 * Ex.: rateLimit(`login:${email}`, 5, 60 * 15)
 */
export async function rateLimit(key: string, limit: number, windowSec: number) {
  const resetAt = new Date(Date.now() + windowSec * 1000)
  const [row] = await db
    .insert(rateLimits)
    .values({ key, count: 1, resetAt })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`case when ${rateLimits.resetAt} < now() then 1 else ${rateLimits.count} + 1 end`,
        resetAt: sql`case when ${rateLimits.resetAt} < now() then ${resetAt} else ${rateLimits.resetAt} end`,
      },
    })
    .returning({ count: rateLimits.count })
  return row.count <= limit
}
