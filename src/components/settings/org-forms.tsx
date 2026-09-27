"use client"

import { useTransition } from "react"
import { LogOut, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { ConfirmAction } from "@/components/crm/confirm-button"
import { Field, SubmitButton, fieldError, useActionToast, useFormAction } from "@/components/form"
import { Button } from "@/components/ui/button"
import { deleteOrgAction, leaveOrgAction, updateOrgAction, uploadOrgLogoAction } from "@/server/actions/org"
import { ImageUpload } from "./image-upload"
import { SettingsSection } from "./section"

export function OrgGeneral({ org, canEdit }: { org: { name: string; slug: string; logoUrl: string | null }; canEdit: boolean }) {
  const [state, onSubmit, pending] = useFormAction(updateOrgAction)
  useActionToast(state)
  return (
    <>
      <SettingsSection title="Logo" description="Usado no seletor de organizações e nos convites.">
        {canEdit ? (
          <ImageUpload
            current={org.logoUrl}
            shape="square"
            fallback={<span className="text-muted-foreground">{org.name.slice(0, 1).toUpperCase()}</span>}
            upload={uploadOrgLogoAction}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Apenas administradores podem alterar o logo.</p>
        )}
      </SettingsSection>
      <form onSubmit={onSubmit}>
        <SettingsSection
          title="Dados da organização"
          description="Nome exibido para todo o time."
          footer={
            canEdit ? (
              <SubmitButton pending={pending} size="sm">
                Salvar
              </SubmitButton>
            ) : undefined
          }
        >
          <div className="grid max-w-sm gap-4">
            <Field
              label="Nome"
              name="name"
              defaultValue={org.name}
              required
              disabled={!canEdit}
              error={fieldError(state, "name")}
            />
            <Field label="Identificador" name="slug" defaultValue={org.slug} disabled hint="Gerado automaticamente." />
          </div>
        </SettingsSection>
      </form>
    </>
  )
}

export function OrgDanger({ role, orgName }: { role: "owner" | "admin" | "member"; orgName: string }) {
  const [pending, start] = useTransition()
  return (
    <SettingsSection
      danger
      title="Zona de perigo"
      description={role === "owner" ? "Ações irreversíveis sobre toda a organização." : "Sair desta organização."}
    >
      {role === "owner" ? (
        <ConfirmAction
          title={`Excluir ${orgName}?`}
          description="Todos os negócios, contatos, empresas, atividades e membros desta organização serão apagados permanentemente. Esta ação não pode ser desfeita."
          confirmLabel="Excluir organização"
          onConfirm={() => deleteOrgAction()}
          trigger={
            <Button variant="destructive">
              <Trash2 /> Excluir organização
            </Button>
          }
        />
      ) : (
        <Button
          variant="destructive"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await leaveOrgAction()
              if (r && !r.ok) toast.error(r.error)
            })
          }
        >
          <LogOut /> Sair da organização
        </Button>
      )}
    </SettingsSection>
  )
}
