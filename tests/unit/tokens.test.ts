import { describe, expect, it } from "vitest"
import { createToken, hashToken, isExpired, addMinutes } from "@/lib/tokens"

describe("tokens", () => {
  it("gera token base64url e hash sha256 correspondente", () => {
    const { token, hash } = createToken()
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
    expect(hashToken(token)).toBe(hash)
  })
  it("gera tokens únicos", () => {
    expect(createToken().token).not.toBe(createToken().token)
  })
  it("detecta expiração", () => {
    const now = new Date("2026-01-01T12:00:00Z")
    expect(isExpired(new Date("2026-01-01T11:59:59Z"), now)).toBe(true)
    expect(isExpired(addMinutes(now, 60), now)).toBe(false)
  })
})
