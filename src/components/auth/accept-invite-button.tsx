"use client"

import { useTransition } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { acceptInviteAction } from "@/server/actions/org"

export function AcceptInviteButton({ token }: { token: string }) {
  const [pending, start] = useTransition()
  return (
    <Button
      size="lg"
      className="h-10"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await acceptInviteAction(token)
          if (res && !res.ok) toast.error(res.error)
        })
      }
    >
      {pending && <Loader2 className="animate-spin" />} Aceitar convite
    </Button>
  )
}
