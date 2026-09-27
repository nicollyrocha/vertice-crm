"use client"

import { useTransition } from "react"
import { MailWarning } from "lucide-react"
import { toast } from "sonner"
import { resendVerificationAction } from "@/server/actions/auth"

export function VerifyBanner({ email }: { email: string }) {
  const [pending, start] = useTransition()
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b bg-warning/10 px-4 py-2 text-sm sm:px-6">
      <MailWarning className="size-4 shrink-0 text-warning" />
      <span className="text-foreground/90">
        Confirme seu email <b className="font-medium">{email}</b> para proteger sua conta.
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await resendVerificationAction()
            if (r?.ok) toast.success(r.message)
            else if (r) toast.error(r.error)
          })
        }
        className="font-medium underline underline-offset-4 disabled:opacity-50"
      >
        {pending ? "Enviando…" : "Reenviar email"}
      </button>
    </div>
  )
}
