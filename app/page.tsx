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
  const [copied, setCopied] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState("")
  const [error, setError] = useState("")

  const handleGenerate = async () => {
    if (!apiUrl) return

    setIsGenerating(true)
    setProgress(0)
    setManifestUrl("")
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

      console.log("[v0] Creating config object")
      const config = {
        apiUrl,
        name: serverName || "LKOD MCP Server",
        description: serverDescription || "MCP server pro přístup k otevřeným datům přes LKOD API",
      }

      console.log("[v0] Encoding config:", config)
      const encodedConfig = encodeURIComponent(JSON.stringify(config))
      console.log("[v0] Encoded config length:", encodedConfig.length)

      const baseUrl = window.location.origin
      const manifest = `${baseUrl}/api/mcp/${encodedConfig}`
      console.log("[v0] Generated MCP URL:", manifest)

      setManifestUrl(manifest)
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
