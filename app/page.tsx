"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle2, Copy, ExternalLink } from "lucide-react"

export default function Home() {
  const [apiUrl, setApiUrl] = useState("")
  const [serverName, setServerName] = useState("")
  const [serverDescription, setServerDescription] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [manifestUrl, setManifestUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState("")

  const handleGenerate = async () => {
    if (!apiUrl) return

    setIsGenerating(true)
    setProgress(0)
    setManifestUrl("")

    // Simulate deployment process with realistic steps
    const steps = [
      { message: "Analyzuji LKOD API...", duration: 1000 },
      { message: "Generuji MCP server kód...", duration: 1500 },
      { message: "Vytvářím konfigurační soubory...", duration: 1000 },
      { message: "Nahrávám na Vercel...", duration: 2000 },
      { message: "Dokončuji deployment...", duration: 1500 },
    ]

    for (let i = 0; i < steps.length; i++) {
      setProgressMessage(steps[i].message)
      setProgress(((i + 1) / steps.length) * 100)
      await new Promise((resolve) => setTimeout(resolve, steps[i].duration))
    }

    // Generate a unique deployment URL based on the server name or API URL
    const slug = (serverName || "mcp-server")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

    const uniqueId = Math.random().toString(36).substring(2, 8)
    const deploymentUrl = `https://${slug}-${uniqueId}.vercel.app`
    const manifest = `${deploymentUrl}/manifest.json`

    setManifestUrl(manifest)
    setIsGenerating(false)
    setProgressMessage("Hotovo!")
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
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">MCP Server Builder</h1>
            <p className="text-slate-400 text-lg">Vytvořte MCP server pro vaše otevřená data během několika sekund</p>
          </div>

          {/* Main Form Card */}
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Konfigurace MCP serveru</CardTitle>
              <CardDescription className="text-slate-400">
                Zadejte URL vašeho LKOD API a volitelně název a popis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* API URL Field */}
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

              {/* Server Name Field */}
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

              {/* Server Description Field */}
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

              {/* Generate Button */}
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

              {/* Progress Indicator */}
              {isGenerating && (
                <div className="space-y-2">
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-sm text-slate-400 text-center">{progressMessage}</p>
                </div>
              )}

              {/* Result - Manifest URL */}
              {manifestUrl && !isGenerating && (
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">MCP server úspěšně vytvořen!</span>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="manifestUrl" className="text-white">
                      Manifest URL
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

                  {/* Instructions */}
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

          {/* Footer Info */}
          <div className="mt-8 text-center text-sm text-slate-500">
            <p>Celý proces proběhne automaticky bez nutnosti GitHubu nebo terminálu</p>
          </div>
        </div>
      </div>
    </div>
  )
}
