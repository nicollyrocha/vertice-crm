"use server"

import { requireOrgContext } from "@/server/context"
import { globalSearch, type SearchHit } from "@/server/data/search"

export async function searchAction(term: string): Promise<SearchHit[]> {
  const ctx = await requireOrgContext()
  return globalSearch(ctx, term.slice(0, 100))
}
