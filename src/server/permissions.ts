import type { Role } from "@/db/schema"

export type Action =
  | "org:update"
  | "org:delete"
  | "members:invite"
  | "members:remove"
  | "members:role"
  | "pipeline:manage"

const matrix: Record<Role, ReadonlySet<Action>> = {
  owner: new Set<Action>([
    "org:update",
    "org:delete",
    "members:invite",
    "members:remove",
    "members:role",
    "pipeline:manage",
  ]),
  admin: new Set<Action>(["org:update", "members:invite", "members:remove", "members:role", "pipeline:manage"]),
  member: new Set<Action>(),
}

export function can(role: Role, action: Action) {
  return matrix[role].has(action)
}

export function canChangeRole(actor: Role, target: Role, next: Role) {
  if (!can(actor, "members:role")) return false
  if (actor === "owner") return true
  return target !== "owner" && next !== "owner"
}

export function canRemoveMember(actor: Role, target: Role) {
  if (target === "owner") return false
  return can(actor, "members:remove")
}

export const roleLabels: Record<Role, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  member: "Membro",
}
