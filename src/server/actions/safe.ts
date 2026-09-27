import "server-only"
import { fail, type ActionResult } from "@/lib/action"
import { ForbiddenError } from "@/server/context"
import { NotFoundInOrg } from "@/server/data/guards"

/** Converte erros de domínio conhecidos em ActionResult; relança o resto (inclui redirects). */
export async function guarded<T>(fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await fn()
  } catch (error) {
    if (error instanceof ForbiddenError || error instanceof NotFoundInOrg) return fail(error.message)
    throw error
  }
}
