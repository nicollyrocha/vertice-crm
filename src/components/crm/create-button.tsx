"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CompanyDialog, ContactDialog, type Option } from "./entity-forms"

/** Botão "Novo" que também abre automaticamente com ?new=1 (atalho do ⌘K). */
function useAutoOpen() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(params.get("new") === "1")
  return {
    open,
    setOpen: (o: boolean) => {
      setOpen(o)
      if (!o && params.get("new")) router.replace(pathname)
    },
  }
}

export function NewContactButton({ companies, label = "Novo contato" }: { companies: Option[]; label?: string }) {
  const { open, setOpen } = useAutoOpen()
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus /> {label}
      </Button>
      <ContactDialog open={open} onOpenChange={setOpen} companies={companies} />
    </>
  )
}

export function NewCompanyButton({ label = "Nova empresa" }: { label?: string }) {
  const { open, setOpen } = useAutoOpen()
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus /> {label}
      </Button>
      <CompanyDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
