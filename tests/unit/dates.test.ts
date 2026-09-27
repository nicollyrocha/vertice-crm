import { describe, expect, it } from "vitest"
import { startOfDayInTz, startOfMonthInTz, tzOffsetMinutes, parseDateOnly } from "@/lib/dates"

const TZ = "America/Sao_Paulo"

describe("dates", () => {
  it("calcula offset de São Paulo (UTC-3)", () => {
    expect(tzOffsetMinutes(new Date("2026-09-27T12:00:00Z"), TZ)).toBe(-180)
  })
  it("início do dia no fuso local", () => {
    // 01:30 UTC do dia 28 ainda é dia 27 em SP
    const d = startOfDayInTz(new Date("2026-09-28T01:30:00Z"), TZ)
    expect(d.toISOString()).toBe("2026-09-27T03:00:00.000Z")
  })
  it("início do mês com deslocamento", () => {
    expect(startOfMonthInTz(0, new Date("2026-09-15T12:00:00Z"), TZ).toISOString()).toBe("2026-09-01T03:00:00.000Z")
    expect(startOfMonthInTz(-1, new Date("2026-01-15T12:00:00Z"), TZ).toISOString()).toBe("2025-12-01T03:00:00.000Z")
  })
  it("data sem hora vira meio-dia UTC (estável em qualquer fuso)", () => {
    expect(parseDateOnly("2026-10-05")?.toISOString()).toBe("2026-10-05T12:00:00.000Z")
    expect(parseDateOnly("x")).toBeNull()
  })
})
