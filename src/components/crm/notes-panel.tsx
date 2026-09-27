"use client"

import { useRef, useTransition } from "react"
import { Loader2, StickyNote, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { UserAvatar } from "@/components/app/user-avatar"
import { useActionToast, useFormAction } from "@/components/form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatRelative } from "@/lib/format"
import { createNoteAction, deleteNoteAction } from "@/server/actions/activities"
import type { NoteRow } from "@/server/data/notes"

export function NotesPanel({
  notes,
  refs,
  currentUserId,
}: {
  notes: NoteRow[]
  refs: { dealId?: string; contactId?: string; companyId?: string }
  currentUserId: string
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, onSubmit, pending] = useFormAction(createNoteAction)
  useActionToast(state, () => formRef.current?.reset())
  const [deleting, startDelete] = useTransition()

  return (
    <div className="space-y-4">
      <form ref={formRef} onSubmit={onSubmit} className="rounded-xl border bg-card p-3 focus-within:ring-2 focus-within:ring-ring/30">
        {Object.entries(refs).map(([k, v]) => v && <input key={k} type="hidden" name={k} value={v} />)}
        <Textarea
          name="body"
          placeholder="Escreva uma nota… (Ctrl+Enter para salvar)"
          rows={3}
          required
          className="min-h-0 resize-none border-0 bg-transparent p-1 shadow-none focus-visible:ring-0 dark:bg-transparent"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) formRef.current?.requestSubmit()
          }}
        />
        <div className="flex justify-end">
          <Button size="sm" type="submit" disabled={pending}>
            {pending && <Loader2 className="animate-spin" />} Adicionar nota
          </Button>
        </div>
      </form>

      {notes.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
          <StickyNote className="size-4" /> Nenhuma nota ainda. Registre contexto da conversa, objeções e próximos passos.
        </div>
      ) : (
        <ul className="space-y-3">
          {notes.map((n) => (
            <li key={n.id} className="group rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2">
                <UserAvatar name={n.authorName} image={n.authorImage} className="size-6" />
                <span className="text-sm font-medium">{n.authorName ?? "Usuário removido"}</span>
                <span className="text-xs text-muted-foreground">{formatRelative(n.createdAt)}</span>
                {n.authorId === currentUserId && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="ml-auto opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    aria-label="Excluir nota"
                    disabled={deleting}
                    onClick={() =>
                      startDelete(async () => {
                        const r = await deleteNoteAction(n.id)
                        if (r.ok) toast.success(r.message)
                        else toast.error(r.error)
                      })
                    }
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{n.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
