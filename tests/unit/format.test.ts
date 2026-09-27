import { describe, expect, it } from "vitest"
import { formatBRL, initials, parseBRLToCents, formatCompactBRL } from "@/lib/format"

const norm = (s: string) => s.replace(/ /g, " ")

describe("formatBRL", () => {
  it("formata centavos como moeda brasileira", () => {
    expect(norm(formatBRL(123456))).toBe("R$ 1.234,56")
    expect(norm(formatBRL(0))).toBe("R$ 0,00")
  })
})

describe("formatCompactBRL", () => {
  it("abrevia valores grandes", () => {
    expect(norm(formatCompactBRL(150_000_00))).toBe("R$ 150 mil")
  })
})

describe("parseBRLToCents", () => {
  it("converte string em reais para centavos", () => {
    expect(parseBRLToCents("1.234,56")).toBe(123456)
    expect(parseBRLToCents("R$ 10")).toBe(1000)
    expect(parseBRLToCents("99,9")).toBe(9990)
    expect(parseBRLToCents("")).toBe(0)
  })
  it("retorna NaN para lixo", () => {
    expect(parseBRLToCents("abc")).toBeNaN()
  })
})

describe("initials", () => {
  it("pega primeira e última inicial", () => {
    expect(initials("Ana Maria Souza")).toBe("AS")
    expect(initials("joão")).toBe("J")
    expect(initials("")).toBe("?")
    expect(initials(null)).toBe("?")
  })
})
