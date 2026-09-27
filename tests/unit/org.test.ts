import { describe, expect, it } from "vitest"
import { defaultStages, slugify } from "@/lib/org"

describe("org", () => {
  it("gera slug sem acentos", () => {
    expect(slugify("Ação & Cia Ltda.")).toBe("acao-cia-ltda")
    expect(slugify("!!!")).toBe("org")
  })
  it("pipeline padrão termina em estágio de ganho", () => {
    expect(defaultStages.at(-1)?.isWon).toBe(true)
    expect(defaultStages.filter((s) => s.isWon)).toHaveLength(1)
  })
})
