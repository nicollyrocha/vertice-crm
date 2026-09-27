import { z } from "zod"

const schema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Vértice <onboarding@resend.dev>"),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  AUTH_GITHUB_ID: z.string().optional(),
  AUTH_GITHUB_SECRET: z.string().optional(),
})

type Env = z.infer<typeof schema>

let cached: Env | undefined

/** Validação lazy: não quebra o build quando variáveis não existem no ambiente de build. */
export function env(): Env {
  if (cached) return cached
  const parsed = schema.safeParse(process.env)
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.path.join(".")).join(", ")
    throw new Error(`Variáveis de ambiente inválidas: ${missing}. Veja .env.example.`)
  }
  cached = parsed.data
  return cached
}

export const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
