import { z } from "zod"
import { email, password } from "./shared"

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(80),
  email,
  password,
})

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Informe a senha"),
})

export const forgotPasswordSchema = z.object({ email })

export const resetPasswordSchema = z
  .object({ token: z.string().min(1), password, confirm: z.string() })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "As senhas não coincidem" })

export const changePasswordSchema = z
  .object({ current: z.string().min(1, "Informe a senha atual"), password, confirm: z.string() })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "As senhas não coincidem" })
  .refine((d) => d.password !== d.current, { path: ["password"], message: "A nova senha deve ser diferente da atual" })

export const changeEmailSchema = z.object({
  email,
  password: z.string().optional(),
})

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(80),
})
