import { createHash, randomBytes } from "node:crypto"

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

/** Token em texto vai por email; só o hash é persistido. */
export function createToken() {
  const token = randomBytes(32).toString("base64url")
  return { token, hash: hashToken(token) }
}

export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000)
}

export function isExpired(expiresAt: Date, now = new Date()) {
  return expiresAt.getTime() <= now.getTime()
}
