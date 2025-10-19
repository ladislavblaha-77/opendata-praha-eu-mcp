"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface MCPServerConfig {
  apiUrl: string
  apiType: string
  actions: string
  serverName: string
  serverDescription: string
  contactEmail: string
  domain: string
}

interface WizardContextType {
  currentStep: number
  setCurrentStep: (step: number) => void
  config: MCPServerConfig
  updateConfig: (updates: Partial<MCPServerConfig>) => void
  deploymentUrl: string
  setDeploymentUrl: (url: string) => void
}

const WizardContext = createContext<WizardContextType | undefined>(undefined)

export function WizardProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [deploymentUrl, setDeploymentUrl] = useState("")
  const [config, setConfig] = useState<MCPServerConfig>({
    apiUrl: "",
    apiType: "ckan",
    actions: "",
    serverName: "",
    serverDescription: "",
    contactEmail: "",
    domain: "",
  })

  const updateConfig = (updates: Partial<MCPServerConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }))
  }

  return (
    <WizardContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        config,
        updateConfig,
        deploymentUrl,
        setDeploymentUrl,
      }}
    >
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard() {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error("useWizard must be used within WizardProvider")
  }
  return context
}
