"use client"
import { WizardProvider } from "@/components/wizard-context"
import { WizardLayout } from "@/components/wizard-layout"
import { ApiConfigStep } from "@/components/steps/api-config-step"
import { ActionsStep } from "@/components/steps/actions-step"
import { MetadataStep } from "@/components/steps/metadata-step"
import { PreviewStep } from "@/components/steps/preview-step"
import { SuccessStep } from "@/components/steps/success-step"

export default function Home() {
  return (
    <WizardProvider>
      <WizardLayout>
        <ApiConfigStep />
        <ActionsStep />
        <MetadataStep />
        <PreviewStep />
        <SuccessStep />
      </WizardLayout>
    </WizardProvider>
  )
}
