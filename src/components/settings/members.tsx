"use client"

import { useTransition } from "react"
import { Mail, MoreHorizontal, UserPlus, X } from "lucide-react"
import { toast } from "sonner"
import { UserAvatar } from "@/components/app/user-avatar"
import { FormDialog } from "@/components/crm/form-dialog"
import { Field, fieldError } from "@/components/form"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import type { Role } from "@/db/schema"
import type { ActionResult } from "@/lib/action"
import { formatDate } from "@/lib/format"
import { changeRoleAction, inviteMemberAction, removeMemberAction, revokeInviteAction } from "@/server/actions/org"
import { canChangeRole, canRemoveMember, roleLabels } from "@/server/permissions"

type Member = { userId: string; name: string | null; email: string; image: string | null; role: Role; joinedAt: Date }
type Invite = { id: string; email: string; role: Role; expiresAt: Date }

function useRun() {
  const [pending, start] = useTransition()
  const run = (fn: () => Promise<ActionResult>) =>
    start(async () => {
      const r = await fn()
      if (r.ok) toast.success(r.message ?? "Feito.")
      else toast.error(r.error)
    })
  return { pending, run }
}

const roleTone: Record<Role, string> = {
  owner: "bg-brand-soft text-brand",
  admin: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  member: "bg-muted text-muted-foreground",
}

export function InviteButton() {
  return (
    <FormDialog
      trigger={
        <Button>
          <UserPlus /> Convidar
        </Button>
      }
      title="Convidar para a organização"
      description="Enviaremos um convite por email, válido por 7 dias."
      action={inviteMemberAction}
      submitLabel="Enviar convite"
    >
      {(state) => (
        <>
          <Field label="Email" name="email" type="email" placeholder="colega@empresa.com" required autoFocus error={fieldError(state, "email")} />
          <div className="grid gap-1.5">
            <Label htmlFor="f-role">Papel</Label>
            <NativeSelect id="f-role" name="role" defaultValue="member">
              <option value="member">Membro — usa o CRM</option>
              <option value="admin">Administrador — gerencia time e pipeline</option>
            </NativeSelect>
          </div>
        </>
      )}
    </FormDialog>
  )
}

export function MembersList({ members, me, myRole }: { members: Member[]; me: string; myRole: Role }) {
  const { pending, run } = useRun()
  return (
    <ul className="-my-2 divide-y">
      {members.map((m) => {
        const isMe = m.userId === me
        const roles = (["owner", "admin", "member"] as Role[]).filter((r) => r !== m.role && canChangeRole(myRole, m.role, r))
        const removable = !isMe && canRemoveMember(myRole, m.role)
        return (
          <li key={m.userId} className="flex items-center gap-3 py-3">
            <UserAvatar name={m.name ?? m.email} image={m.image} className="size-9" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                {m.name ?? m.email} {isMe && <span className="text-muted-foreground">(você)</span>}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {m.email} · desde {formatDate(m.joinedAt)}
              </div>
            </div>
            <span className={`hidden rounded-full px-2 py-0.5 text-xs font-medium sm:inline ${roleTone[m.role]}`}>{roleLabels[m.role]}</span>
            {!isMe && (roles.length > 0 || removable) ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" disabled={pending} aria-label="Gerenciar membro">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {roles.length > 0 && <DropdownMenuLabel className="text-xs text-muted-foreground">Alterar papel</DropdownMenuLabel>}
                  {roles.map((r) => (
                    <DropdownMenuItem key={r} onSelect={() => run(() => changeRoleAction(m.userId, r))}>
                      {r === "owner" ? "Transferir propriedade" : `Tornar ${roleLabels[r].toLowerCase()}`}
                    </DropdownMenuItem>
                  ))}
                  {removable && (
                    <>
                      {roles.length > 0 && <DropdownMenuSeparator />}
                      <DropdownMenuItem variant="destructive" onSelect={() => run(() => removeMemberAction(m.userId))}>
                        Remover da organização
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <span className="w-7" />
            )}
          </li>
        )
      })}
    </ul>
  )
}

export function InvitesList({ invites, canManage }: { invites: Invite[]; canManage: boolean }) {
  const { pending, run } = useRun()
  if (invites.length === 0) return <p className="text-sm text-muted-foreground">Nenhum convite pendente.</p>
  return (
    <ul className="-my-2 divide-y">
      {invites.map((i) => (
        <li key={i.id} className="flex items-center gap-3 py-3">
          <span className="grid size-9 place-items-center rounded-full border border-dashed text-muted-foreground">
            <Mail className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{i.email}</div>
            <div className="text-xs text-muted-foreground">
              {roleLabels[i.role]} · expira em {formatDate(i.expiresAt)}
            </div>
          </div>
          {canManage && (
            <Button variant="ghost" size="sm" disabled={pending} onClick={() => run(() => revokeInviteAction(i.id))}>
              <X /> Cancelar
            </Button>
          )}
        </li>
      ))}
    </ul>
  )
}
