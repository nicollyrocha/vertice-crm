import { expect, test } from "@playwright/test"

test("landing renderiza com CTA", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Venda mais")
  await expect(page.getByRole("link", { name: /começar grátis/i }).first()).toBeVisible()
})

test("área logada exige login", async ({ page }) => {
  await page.goto("/app/deals")
  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fapp%2Fdeals/)
  await expect(page.getByRole("heading", { name: "Bem-vindo de volta" })).toBeVisible()
})

test("login inválido mostra erro sem limpar o email", async ({ page }) => {
  test.skip(!process.env.DATABASE_URL, "requer banco")
  await page.goto("/login")
  await page.getByLabel("Email").fill("naoexiste@example.com")
  await page.getByLabel("Senha", { exact: true }).fill("senhaerrada123")
  await page.getByRole("button", { name: "Entrar" }).click()
  await expect(page.getByRole("alert")).toContainText("Email ou senha incorretos")
  await expect(page.getByLabel("Email")).toHaveValue("naoexiste@example.com")
})

test("fluxo completo: cadastro → onboarding → dashboard", async ({ page }) => {
  test.skip(!process.env.DATABASE_URL, "requer banco")
  const email = `e2e+${Date.now()}@example.com`
  await page.goto("/signup")
  await page.getByLabel("Nome completo").fill("Teste E2E")
  await page.getByLabel("Email de trabalho").fill(email)
  await page.getByLabel("Senha", { exact: true }).fill("senhaForte#2026")
  await page.getByRole("button", { name: "Criar conta grátis" }).click()
  await expect(page).toHaveURL(/\/onboarding/)
  await page.getByLabel("Nome da empresa").fill("Empresa E2E")
  await page.getByRole("button", { name: "Criar workspace" }).click()
  await expect(page).toHaveURL(/\/app$/)
  await expect(page.getByText("Pipeline em aberto")).toBeVisible()
})
