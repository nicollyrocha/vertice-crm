"use client"

import { useRef, useState, useTransition } from "react"
import { Camera, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import type { FormState } from "@/lib/action"
import { cn } from "@/lib/utils"

/** Upload de imagem com preview instantâneo, validação no cliente e server action. */
export function ImageUpload({
  current,
  fallback,
  upload,
  remove,
  shape = "circle",
}: {
  current: string | null
  fallback: React.ReactNode
  upload: (fd: FormData) => Promise<FormState>
  remove?: () => Promise<FormState>
  shape?: "circle" | "square"
}) {
  const input = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const shown = preview ?? current

  function onFile(file: File | undefined) {
    if (!file) return
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return toast.error("Use JPG, PNG ou WEBP.")
    if (file.size > 2 * 1024 * 1024) return toast.error("A imagem deve ter no máximo 2 MB.")
    const url = URL.createObjectURL(file)
    setPreview(url)
    const fd = new FormData()
    fd.set("file", file)
    start(async () => {
      const r = await upload(fd)
      if (r?.ok) toast.success(r.message)
      else if (r) {
        toast.error(r.error)
        setPreview(null)
      }
      if (input.current) input.current.value = ""
    })
  }

  return (
    <div className="flex items-center gap-5">
      <button
        type="button"
        onClick={() => input.current?.click()}
        className={cn(
          "group relative grid size-20 shrink-0 place-items-center overflow-hidden border bg-muted text-2xl font-semibold",
          shape === "circle" ? "rounded-full" : "rounded-2xl",
        )}
        aria-label="Alterar imagem"
      >
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="" className="size-full object-cover" />
        ) : (
          fallback
        )}
        <span className="absolute inset-0 grid place-items-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
          {pending ? <Loader2 className="size-5 animate-spin" /> : <Camera className="size-5" />}
        </span>
      </button>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => input.current?.click()}>
            {pending ? <Loader2 className="animate-spin" /> : <Camera />} Enviar imagem
          </Button>
          {remove && current && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const r = await remove()
                  setPreview(null)
                  if (r?.ok) toast.success(r.message)
                })
              }
            >
              <Trash2 /> Remover
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">JPG, PNG ou WEBP. Máximo de 2 MB.</p>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  )
}
