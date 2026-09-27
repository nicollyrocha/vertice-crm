"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function PasswordInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} className={cn("pr-10", className)} {...props} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted-foreground transition-colors hover:text-foreground"
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        tabIndex={-1}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}

/** Barra simples de força de senha (heurística local, só feedback visual). */
export function PasswordStrength({ value }: { value: string }) {
  let score = 0
  if (value.length >= 8) score++
  if (value.length >= 12) score++
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score++
  const labels = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"]
  const colors = ["bg-destructive", "bg-destructive", "bg-warning", "bg-success", "bg-success"]
  if (!value) return null
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cn("h-1 flex-1 rounded-full bg-muted", i < score && colors[score])} />
        ))}
      </div>
      <span className="w-20 text-right text-[11px] text-muted-foreground">{labels[score]}</span>
    </div>
  )
}
