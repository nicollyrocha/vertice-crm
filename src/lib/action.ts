import type { ZodError } from "zod"

export type FieldErrors = Record<string, string[] | undefined>

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fieldErrors?: FieldErrors }

export type FormState = ActionResult<unknown> | null

export function ok<T>(data?: T, message?: string): ActionResult<T> {
  return { ok: true, data, message }
}

export function fail(error: string, fieldErrors?: FieldErrors): { ok: false; error: string; fieldErrors?: FieldErrors } {
  return { ok: false, error, fieldErrors }
}

export function fromZod(error: ZodError) {
  const fieldErrors: FieldErrors = {}
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_"
    ;(fieldErrors[key] ??= []).push(issue.message)
  }
  return fail("Verifique os campos destacados.", fieldErrors)
}
