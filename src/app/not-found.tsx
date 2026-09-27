import Link from "next/link"
import { LogoMark } from "@/components/logo"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 bg-dots [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="relative text-center">
        <LogoMark className="mx-auto size-10" />
        <p className="mt-8 font-mono text-sm text-brand">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Página não encontrada</h1>
        <p className="mt-3 text-muted-foreground">O endereço pode ter mudado ou o registro foi removido.</p>
        <div className="mt-8 flex justify-center gap-2">
          <Button asChild>
            <Link href="/app">Ir para o app</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Página inicial</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
