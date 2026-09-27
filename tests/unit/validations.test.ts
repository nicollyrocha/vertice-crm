import { describe, expect, it } from "vitest"
import { signUpSchema, resetPasswordSchema, changePasswordSchema } from "@/lib/validations/auth"
import { dealSchema, contactSchema } from "@/lib/validations/crm"

describe("auth schemas", () => {
  it("rejeita senha curta no cadastro", () => {
    const r = signUpSchema.safeParse({ name: "Ana", email: "ana@x.com", password: "123" })
    expect(r.success).toBe(false)
  })
  it("normaliza email", () => {
    const r = signUpSchema.parse({ name: "Ana", email: "  ANA@X.com ", password: "12345678" })
    expect(r.email).toBe("ana@x.com")
  })
  it("exige confirmação igual no reset", () => {
    expect(resetPasswordSchema.safeParse({ token: "t", password: "12345678", confirm: "123456789" }).success).toBe(false)
    expect(resetPasswordSchema.safeParse({ token: "t", password: "12345678", confirm: "12345678" }).success).toBe(true)
  })
  it("nova senha precisa ser diferente da atual", () => {
    expect(
      changePasswordSchema.safeParse({ current: "12345678", password: "12345678", confirm: "12345678" }).success,
    ).toBe(false)
  })
})

describe("crm schemas", () => {
  it("converte valor em reais para centavos", () => {
    const r = dealSchema.parse({ title: "Licença anual", value: "1.234,56", stageId: "s1" })
    expect(r.valueCents).toBe(123456)
  })
  it("rejeita valor inválido", () => {
    expect(dealSchema.safeParse({ title: "X", value: "abc", stageId: "s1" }).success).toBe(false)
  })
  it("campos opcionais vazios viram null", () => {
    const r = contactSchema.parse({ firstName: "João", email: "", companyId: "" })
    expect(r.email).toBeNull()
    expect(r.companyId).toBeNull()
  })
})
