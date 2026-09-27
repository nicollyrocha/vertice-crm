import { z } from "zod"

export const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Informe o email")
  .email("Email inválido")

export const password = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres")
  .max(128, "Senha muito longa")

/** "" | undefined -> null; demais strings aparadas. */
export const optionalText = (max = 200) =>
  z
    .string()
    .trim()
    .max(max, `Máximo de ${max} caracteres`)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null))

export const optionalId = optionalText(100)
