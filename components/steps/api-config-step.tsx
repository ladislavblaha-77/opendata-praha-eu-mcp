"use client"

import { useState } from "react"
import { useWizard } from "../wizard-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Database } from "lucide-react"

export function ApiConfigStep() {
  const { config, updateConfig, setCurrentStep } = useWizard()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleNext = () => {
    const newErrors: Record<string, string> = {}

    if (!config.apiUrl) {
      newErrors.apiUrl = "API URL is required"
    } else {
      try {
        new URL(config.apiUrl)
      } catch {
        newErrors.apiUrl = "Please enter a valid URL"
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setCurrentStep(1)
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-accent/10">
            <Database className="w-6 h-6 text-accent" />
          </div>
          <div>
            <CardTitle className="text-2xl">API Configuration</CardTitle>
            <CardDescription className="text-base mt-1">Connect your open data catalog API</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="apiUrl" className="text-base">
            API URL <span className="text-destructive">*</span>
          </Label>
          <Input
            id="apiUrl"
            placeholder="https://data.example.com/api/3/action"
            value={config.apiUrl}
            onChange={(e) => updateConfig({ apiUrl: e.target.value })}
            className={errors.apiUrl ? "border-destructive" : ""}
          />
          {errors.apiUrl && <p className="text-sm text-destructive">{errors.apiUrl}</p>}
          <p className="text-sm text-muted-foreground">Enter the base URL of your open data catalog API</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiType" className="text-base">
            API Type
          </Label>
          <Select value={config.apiType} onValueChange={(value) => updateConfig({ apiType: value })}>
            <SelectTrigger id="apiType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ckan">CKAN</SelectItem>
              <SelectItem value="lkod">LKOD (Czech Open Data)</SelectItem>
              <SelectItem value="custom">Custom API</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">Select the type of API your catalog uses</p>
        </div>

        <div className="pt-4 flex justify-end">
          <Button onClick={handleNext} size="lg" className="gap-2">
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
