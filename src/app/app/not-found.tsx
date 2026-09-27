import Link from "next/link"
import { SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AppNotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
      <span className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground">
        <SearchX className="size-5" />
      </span>
      <h1 className="mt-5 text-xl font-semibold">Registro não encontrado</h1>
      <p className="mt-2 text-sm text-muted-foreground">Ele pode ter sido excluído ou pertence a outra organização.</p>
      <Button asChild className="mt-6">
        <Link href="/app">Voltar ao início</Link>
      </Button>
    </div>
  )
}
