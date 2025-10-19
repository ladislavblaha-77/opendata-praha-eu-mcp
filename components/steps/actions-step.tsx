"use client"

import { useState } from "react"
import { useWizard } from "../wizard-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react"

export function ActionsStep() {
  const { config, updateConfig, setCurrentStep } = useWizard()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleNext = () => {
    const newErrors: Record<string, string> = {}

    if (!config.actions || config.actions.trim().length < 10) {
      newErrors.actions = "Please describe at least one action (minimum 10 characters)"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setCurrentStep(2)
  }

  const handleBack = () => {
    setCurrentStep(0)
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-accent/10">
            <Sparkles className="w-6 h-6 text-accent" />
          </div>
          <div>
            <CardTitle className="text-2xl">Define Actions</CardTitle>
            <CardDescription className="text-base mt-1">
              Describe what your MCP server should be able to do
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="actions" className="text-base">
            Server Actions <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="actions"
            placeholder="Example: Search datasets by name, display dataset metadata, return data samples, list all available datasets, filter by category..."
            value={config.actions}
            onChange={(e) => updateConfig({ actions: e.target.value })}
            className={`min-h-[200px] ${errors.actions ? "border-destructive" : ""}`}
          />
          {errors.actions && <p className="text-sm text-destructive">{errors.actions}</p>}
          <p className="text-sm text-muted-foreground">
            Describe in natural language what actions the MCP server should support. Be specific about search,
            filtering, and data retrieval capabilities.
          </p>
        </div>

        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2">Example Actions:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Search datasets by name or keyword</li>
            <li>Display detailed metadata for a specific dataset</li>
            <li>Return sample data from a dataset</li>
            <li>List all available datasets with pagination</li>
            <li>Filter datasets by category, tag, or organization</li>
          </ul>
        </div>

        <div className="pt-4 flex justify-between">
          <Button onClick={handleBack} variant="outline" size="lg" className="gap-2 bg-transparent">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button onClick={handleNext} size="lg" className="gap-2">
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
