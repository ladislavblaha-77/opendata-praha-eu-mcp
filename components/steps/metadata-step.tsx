"use client"

import { useState } from "react"
import { useWizard } from "../wizard-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft, Server } from "lucide-react"

export function MetadataStep() {
  const { config, updateConfig, setCurrentStep } = useWizard()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleNext = () => {
    const newErrors: Record<string, string> = {}

    if (!config.serverName || config.serverName.trim().length < 3) {
      newErrors.serverName = "Server name is required (minimum 3 characters)"
    }

    if (!config.serverDescription || config.serverDescription.trim().length < 10) {
      newErrors.serverDescription = "Description is required (minimum 10 characters)"
    }

    if (!config.contactEmail) {
      newErrors.contactEmail = "Contact email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email address"
    }

    if (!config.domain) {
      newErrors.domain = "Domain is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setCurrentStep(3)
  }

  const handleBack = () => {
    setCurrentStep(1)
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-accent/10">
            <Server className="w-6 h-6 text-accent" />
          </div>
          <div>
            <CardTitle className="text-2xl">Server Metadata</CardTitle>
            <CardDescription className="text-base mt-1">Add information about your MCP server</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="serverName" className="text-base">
            Server Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="serverName"
            placeholder="My Open Data MCP Server"
            value={config.serverName}
            onChange={(e) => updateConfig({ serverName: e.target.value })}
            className={errors.serverName ? "border-destructive" : ""}
          />
          {errors.serverName && <p className="text-sm text-destructive">{errors.serverName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="serverDescription" className="text-base">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="serverDescription"
            placeholder="This MCP server provides access to our open data catalog, allowing AI assistants to search and retrieve public datasets..."
            value={config.serverDescription}
            onChange={(e) => updateConfig({ serverDescription: e.target.value })}
            className={`min-h-[120px] ${errors.serverDescription ? "border-destructive" : ""}`}
          />
          {errors.serverDescription && <p className="text-sm text-destructive">{errors.serverDescription}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactEmail" className="text-base">
            Contact Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="contactEmail"
            type="email"
            placeholder="contact@example.com"
            value={config.contactEmail}
            onChange={(e) => updateConfig({ contactEmail: e.target.value })}
            className={errors.contactEmail ? "border-destructive" : ""}
          />
          {errors.contactEmail && <p className="text-sm text-destructive">{errors.contactEmail}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="domain" className="text-base">
            Domain <span className="text-destructive">*</span>
          </Label>
          <Input
            id="domain"
            placeholder="data.example.com"
            value={config.domain}
            onChange={(e) => updateConfig({ domain: e.target.value })}
            className={errors.domain ? "border-destructive" : ""}
          />
          {errors.domain && <p className="text-sm text-destructive">{errors.domain}</p>}
          <p className="text-sm text-muted-foreground">The domain where your MCP server will be accessible</p>
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
