import type { Metadata } from "next"
import { PipelineEditor } from "@/components/settings/pipeline-editor"
import { SettingsSection } from "@/components/settings/section"
import { requireOrgContext } from "@/server/context"
import { getPipelineWithCounts } from "@/server/data/pipeline"
import { can } from "@/server/permissions"

export const metadata: Metadata = { title: "Pipeline" }

export default async function PipelineSettingsPage() {
  const ctx = await requireOrgContext()
  const pipeline = await getPipelineWithCounts(ctx)
  return (
    <SettingsSection
      title="Estágios do pipeline"
      description="Defina as etapas do seu processo de vendas e a probabilidade de fechamento de cada uma. O último estágio marca o negócio como ganho."
    >
      <PipelineEditor stages={pipeline.stages} canManage={can(ctx.role, "pipeline:manage")} />
    </SettingsSection>
  )
}
