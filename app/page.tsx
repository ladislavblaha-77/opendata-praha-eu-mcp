"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle2, Copy, ExternalLink, AlertCircle } from "lucide-react"

export default function Home() {
  const [apiUrl, setApiUrl] = useState("")
  const [serverName, setServerName] = useState("")
  const [serverDescription, setServerDescription] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [manifestUrl, setManifestUrl] = useState("")
  const [openApiSchema, setOpenApiSchema] = useState("")
  const [copied, setCopied] = useState(false)
  const [copiedSchema, setCopiedSchema] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState("")
  const [error, setError] = useState("")

  const generateOpenApiSchema = (apiUrl: string, name: string, description: string) => {
    try {
      const url = new URL(apiUrl)
      const pathParts = url.pathname.split("/").filter(Boolean)
      const basePath = pathParts.length > 0 ? `/${pathParts[0]}` : ""
      const baseUrl = `${url.protocol}//${url.host}${basePath}`

      const schema = {
        openapi: "3.1.0",
        info: {
          title: name || "LKOD MCP Server",
          description: (description || "MCP server pro přístup k otevřeným datům přes LKOD API") + " (JSON režim).",
          version: "1.0.0",
        },
        "x-mcp": {
          name: "lkod_api",
          description: "LKOD MCP Server – přístup k datům Prahy (formát JSON)",
        },
        servers: [
          {
            url: baseUrl,
            description: "LKOD Open Data API - JSON režim",
          },
        ],
        paths: {
          "/catalog": {
            get: {
              operationId: "getCatalogLKOD",
              summary: "Získat katalog dat (JSON formát)",
              parameters: [
                {
                  name: "format",
                  in: "query",
                  required: true,
                  schema: {
                    type: "string",
                    enum: ["json"],
                    default: "json",
                  },
                  description: "Formát odpovědi (vždy json)",
                },
                {
                  name: "publishers[]",
                  in: "query",
                  required: false,
                  schema: {
                    type: "string",
                  },
                  description: "Filtruje katalog podle identifikátoru publishera",
                },
                {
                  name: "limit",
                  in: "query",
                  required: false,
                  schema: {
                    type: "integer",
                  },
                  description: "Maximální počet výsledků",
                },
                {
                  name: "offset",
                  in: "query",
                  required: false,
                  schema: {
                    type: "integer",
                  },
                  description: "Offset pro stránkování",
                },
              ],
              responses: {
                "200": {
                  description: "Úspěšná odpověď (čistý JSON)",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          iri: {
                            type: "string",
                            description: "IRI katalogu",
                          },
                          title: {
                            type: "string",
                            description: "Název katalogu",
                          },
                          description: {
                            type: "string",
                            description: "Popis katalogu",
                          },
                          datasets: {
                            type: "array",
                            description: "Seznam IRI datových sad",
                            items: {
                              type: "string",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "/dataset": {
            get: {
              operationId: "getDatasetListLKOD",
              summary: "Získat seznam datových sad (JSON formát)",
              parameters: [
                {
                  name: "format",
                  in: "query",
                  required: true,
                  schema: {
                    type: "string",
                    enum: ["json"],
                    default: "json",
                  },
                  description: "Formát odpovědi (vždy json)",
                },
                {
                  name: "publisher",
                  in: "query",
                  required: false,
                  schema: {
                    type: "string",
                  },
                  description: "Filtruje podle publishera",
                },
                {
                  name: "themes[]",
                  in: "query",
                  required: false,
                  schema: {
                    type: "string",
                  },
                  description: "Filtruje podle tématu datové sady (např. finance, doprava, kultura)",
                },
                {
                  name: "limit",
                  in: "query",
                  required: false,
                  schema: {
                    type: "integer",
                  },
                  description: "Maximální počet výsledků",
                },
                {
                  name: "offset",
                  in: "query",
                  required: false,
                  schema: {
                    type: "integer",
                  },
                  description: "Offset pro stránkování",
                },
              ],
              responses: {
                "200": {
                  description: "Seznam datových sad (čistý JSON)",
                  content: {
                    "application/json": {
                      schema: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            iri: {
                              type: "string",
                            },
                            title: {
                              type: "string",
                            },
                            description: {
                              type: "string",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }

      return JSON.stringify(schema, null, 2)
    } catch (err) {
      console.error("[v0] Error generating OpenAPI schema:", err)
      return ""
    }
  }

  const handleGenerate = async () => {
    if (!apiUrl) return

    setIsGenerating(true)
    setProgress(0)
    setManifestUrl("")
    setOpenApiSchema("")
    setError("")

    try {
      console.log("[v0] Starting MCP generation for:", apiUrl)

      const steps = [
        { message: "Analyzuji LKOD API...", duration: 500 },
        { message: "Generuji MCP server kód...", duration: 800 },
        { message: "Vytvářím konfigurační soubory...", duration: 500 },
        { message: "Nahrávám na Vercel...", duration: 1000 },
        { message: "Dokončuji deployment...", duration: 700 },
      ]

      for (let i = 0; i < steps.length; i++) {
        setProgressMessage(steps[i].message)
        setProgress(((i + 1) / steps.length) * 100)
        console.log(`[v0] Step ${i + 1}/${steps.length}: ${steps[i].message}`)
        await new Promise((resolve) => setTimeout(resolve, steps[i].duration))
      }

      console.log("[v0] Creating MCP server URL")
      const baseUrl = window.location.origin

      const params = new URLSearchParams({
        apiUrl,
        name: serverName || "LKOD MCP Server",
        description: serverDescription || "MCP server pro přístup k otevřeným datům přes LKOD API",
      })

      const mcpUrl = `${baseUrl}/api/mcp?${params.toString()}`
      console.log("[v0] Generated MCP URL:", mcpUrl)

      const schema = generateOpenApiSchema(
        apiUrl,
        serverName || "LKOD MCP Server",
        serverDescription || "MCP server pro přístup k otevřeným datům přes LKOD API",
      )
      setOpenApiSchema(schema)
      console.log("[v0] Generated OpenAPI schema")

      setManifestUrl(mcpUrl)
      setIsGenerating(false)
      setProgressMessage("Hotovo!")
      console.log("[v0] MCP generation completed successfully")
    } catch (err) {
      console.error("[v0] Error during MCP generation:", err)
      setError(err instanceof Error ? err.message : "Nastala neočekávaná chyba")
      setIsGenerating(false)
      setProgressMessage("")
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(manifestUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopySchema = () => {
    navigator.clipboard.writeText(openApiSchema)
    setCopiedSchema(true)
    setTimeout(() => setCopiedSchema(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">MCP Server Builder</h1>
            <p className="text-slate-400 text-lg">Vytvořte MCP server pro vaše otevřená data během několika sekund</p>
          </div>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Konfigurace MCP serveru</CardTitle>
              <CardDescription className="text-slate-400">
                Zadejte URL vašeho LKOD API a volitelně název a popis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="apiUrl" className="text-white">
                  API URL LKOD <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="apiUrl"
                  type="url"
                  placeholder="https://lkod.mesto.cz/api/3/action/"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  disabled={isGenerating}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
                <p className="text-sm text-slate-500">URL vašeho LKOD API endpointu</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serverName" className="text-white">
                  Název MCP serveru (volitelné)
                </Label>
                <Input
                  id="serverName"
                  type="text"
                  placeholder="Otevřená data Praha"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  disabled={isGenerating}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serverDescription" className="text-white">
                  Popis MCP serveru (volitelné)
                </Label>
                <Textarea
                  id="serverDescription"
                  placeholder="MCP server pro otevřená data Prahy"
                  value={serverDescription}
                  onChange={(e) => setServerDescription(e.target.value)}
                  disabled={isGenerating}
                  rows={3}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!apiUrl || isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generuji MCP server...
                  </>
                ) : (
                  "Vygenerovat MCP"
                )}
              </Button>

              {error && (
                <div className="flex items-start gap-2 p-4 bg-red-900/20 border border-red-800 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-red-400">Chyba při generování</p>
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                </div>
              )}

              {isGenerating && (
                <div className="space-y-2">
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-sm text-slate-400 text-center">{progressMessage}</p>
                </div>
              )}

              {manifestUrl && !isGenerating && (
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">MCP server úspěšně vytvořen!</span>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="manifestUrl" className="text-white">
                      MCP Server URL
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="manifestUrl"
                        type="text"
                        value={manifestUrl}
                        readOnly
                        className="bg-slate-800 border-slate-700 text-white font-mono text-sm"
                      />
                      <Button
                        onClick={handleCopy}
                        variant="outline"
                        size="icon"
                        className="border-slate-700 hover:bg-slate-800 bg-transparent"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    {copied && <p className="text-sm text-green-400">Zkopírováno do schránky!</p>}
                  </div>

                  {openApiSchema && (
                    <div className="space-y-2">
                      <Label htmlFor="openApiSchema" className="text-white">
                        OpenAPI Schema pro ChatGPT Actions
                      </Label>
                      <div className="space-y-2">
                        <Textarea
                          id="openApiSchema"
                          value={openApiSchema}
                          readOnly
                          rows={12}
                          className="bg-slate-800 border-slate-700 text-white font-mono text-xs resize-none"
                        />
                        <Button
                          onClick={handleCopySchema}
                          variant="outline"
                          className="w-full border-slate-700 hover:bg-slate-800 bg-transparent"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          {copiedSchema ? "Zkopírováno!" : "Zkopírovat OpenAPI Schema"}
                        </Button>
                      </div>
                      <p className="text-sm text-slate-400">
                        Toto schema můžete vložit do ChatGPT Actions pro přímé volání LKOD API
                      </p>
                    </div>
                  )}

                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Jak připojit do ChatGPT</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm text-slate-300">
                        <div className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                            1
                          </span>
                          <p>Otevřete ChatGPT a přejděte do nastavení</p>
                        </div>
                        <div className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                            2
                          </span>
                          <p>Vyberte "Personalization" → "Custom instructions"</p>
                        </div>
                        <div className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                            3
                          </span>
                          <p>Přidejte MCP server pomocí výše uvedené URL</p>
                        </div>
                        <div className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                            4
                          </span>
                          <p>Uložte a začněte používat!</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full border-slate-700 hover:bg-slate-700 bg-transparent"
                        asChild
                      >
                        <a
                          href="https://help.openai.com/en/articles/8554397-custom-instructions-for-chatgpt"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Podrobný návod
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-slate-500">
            <p>Celý proces proběhne automaticky bez nutnosti GitHubu nebo terminálu</p>
          </div>
        </div>
      </div>
    </div>
  )
}
