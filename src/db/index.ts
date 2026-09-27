import { neon } from "@neondatabase/serverless"
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http"
import * as schema from "./schema"

type DB = NeonHttpDatabase<typeof schema>

let instance: DB | undefined

export function getDb(): DB {
  if (!instance) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error("DATABASE_URL não definida. Veja .env.example.")
    instance = drizzle(neon(url), { schema, casing: "snake_case" })
  }
  return instance
}

/**
 * Client lazy (não conecta no import, então o build funciona sem DATABASE_URL).
 * Driver HTTP do Neon: ideal para serverless. Para escritas atômicas use `db.batch([...])`.
 */
export const db = new Proxy({} as DB, {
  get(_target, prop) {
    const real = getDb()
    const value = Reflect.get(real, prop)
    return typeof value === "function" ? value.bind(real) : value
  },
})

export { schema }
