"use client"

import { useState } from "react"
import { useWizard } from "../wizard-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Eye, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function PreviewStep() {
  const { config, setCurrentStep, setDeploymentUrl } = useWizard()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleBack = () => {
    setCurrentStep(2)
  }

  const handleDownload = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-server", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      const { files } = await response.json()

      // Create a text file with all the generated files
      let downloadContent = "# MCP Server Files\n\n"
      downloadContent += "Copy each file to your project directory:\n\n"

      Object.entries(files).forEach(([filename, content]) => {
        downloadContent += `\n${"=".repeat(60)}\n`
        downloadContent += `FILE: ${filename}\n`
        downloadContent += `${"=".repeat(60)}\n\n`
        downloadContent += content
        downloadContent += "\n\n"
      })

      // Create download
      const blob = new Blob([downloadContent], { type: "text/plain" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${config.domain.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-mcp-server.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      // Set a placeholder URL for the success page
      setDeploymentUrl("your-deployment-url")
      setCurrentStep(4)
    } catch (error) {
      console.error("Failed to generate files:", error)
      alert("Failed to generate server files. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const generateServerCode = () => {
    return `// Generated MCP Server Configuration
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

const server = new Server({
  name: "${config.serverName}",
  description: "${config.serverDescription}",
  version: "1.0.0"
});

// API Configuration
const API_BASE_URL = "${config.apiUrl}";
const API_TYPE = "${config.apiType}";

// Actions: ${config.actions}

// Server will handle tool requests and connect to your API
server.connect();`
  }

  const generateManifest = () => {
    return `{
  "name": "${config.serverName}",
  "description": "${config.serverDescription}",
  "version": "1.0.0",
  "api": {
    "url": "${config.apiUrl}",
    "type": "${config.apiType}"
  },
  "contact": {
    "email": "${config.contactEmail}"
  },
  "domain": "${config.domain}",
  "capabilities": [
    ${config.actions
      .split(",")
      .map((action) => `"${action.trim()}"`)
      .join(",\n    ")}
  ]
}`
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-accent/10">
            <Eye className="w-6 h-6 text-accent" />
          </div>
          <div>
            <CardTitle className="text-2xl">Preview & Download</CardTitle>
            <CardDescription className="text-base mt-1">Review your configuration and download files</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/50 border border-border rounded-lg p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-1">Server Name</h3>
            <p className="text-foreground">{config.serverName}</p>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-1">API URL</h3>
            <p className="text-foreground font-mono text-sm">{config.apiUrl}</p>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-1">API Type</h3>
            <p className="text-foreground">{config.apiType.toUpperCase()}</p>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-1">Domain</h3>
            <p className="text-foreground">{config.domain}</p>
          </div>
        </div>

        <Tabs defaultValue="server" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="server">Server Code</TabsTrigger>
            <TabsTrigger value="manifest">Manifest</TabsTrigger>
          </TabsList>
          <TabsContent value="server" className="mt-4">
            <div className="bg-card border border-border rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs text-foreground font-mono">{generateServerCode()}</pre>
            </div>
          </TabsContent>
          <TabsContent value="manifest" className="mt-4">
            <div className="bg-card border border-border rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs text-foreground font-mono">{generateManifest()}</pre>
            </div>
          </TabsContent>
        </Tabs>

        <div className="pt-4 flex justify-between">
          <Button
            onClick={handleBack}
            variant="outline"
            size="lg"
            className="gap-2 bg-transparent"
            disabled={isGenerating}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button onClick={handleDownload} size="lg" className="gap-2" disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download Server Files
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
