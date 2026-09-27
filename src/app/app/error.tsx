"use client"

import { useEffect } from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
      <span className="grid size-12 place-items-center rounded-xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-5" />
      </span>
      <h1 className="mt-5 text-xl font-semibold">Algo deu errado</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Não foi possível carregar esta página. Tente novamente em instantes.
        {error.digest && <span className="mt-2 block font-mono text-xs">Código: {error.digest}</span>}
      </p>
      <Button onClick={reset} className="mt-6">
        <RotateCcw /> Tentar novamente
      </Button>
    </div>
  )
}
