"use client"

import type { ReactNode } from "react"
import { useWizard } from "./wizard-context"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  { id: 0, title: "API Configuration", description: "Connect your data catalog" },
  { id: 1, title: "Define Actions", description: "Describe server capabilities" },
  { id: 2, title: "Server Metadata", description: "Add server information" },
  { id: 3, title: "Preview & Deploy", description: "Review and publish" },
  { id: 4, title: "Success", description: "Integration guide" },
]

export function WizardLayout({ children }: { children: ReactNode }) {
  const { currentStep } = useWizard()
  const childrenArray = Array.isArray(children) ? children : [children]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">MCP Server Builder</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Create MCP servers for open data catalogs without coding
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {steps.slice(0, 4).map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                      currentStep > step.id
                        ? "bg-accent border-accent text-accent-foreground"
                        : currentStep === step.id
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-card border-border text-muted-foreground",
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-semibold">{step.id + 1}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        currentStep >= step.id ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground hidden sm:block">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 2 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-4 transition-all",
                      currentStep > step.id ? "bg-accent" : "bg-border",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">{childrenArray[currentStep]}</div>
      </main>
    </div>
  )
}
