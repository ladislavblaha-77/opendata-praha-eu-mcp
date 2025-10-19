"use client"

import { useWizard } from "../wizard-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Terminal, Upload, ExternalLink } from "lucide-react"

export function SuccessStep() {
  const { config } = useWizard()

  return (
    <div className="space-y-6">
      <Card className="border-border border-accent/50">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-accent/10">
              <CheckCircle2 className="w-6 h-6 text-accent" />
            </div>
            <div>
              <CardTitle className="text-2xl">Files Downloaded!</CardTitle>
              <CardDescription className="text-base mt-1">Your MCP server files are ready to deploy</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">Downloaded Files</h3>
            <ul className="space-y-2 text-sm text-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <code className="font-mono">server.js</code> - Main MCP server code
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <code className="font-mono">package.json</code> - Dependencies
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <code className="font-mono">manifest.json</code> - MCP manifest
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <code className="font-mono">README.md</code> - Documentation
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <code className="font-mono">vercel.json</code> - Deployment config
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-xl">Deploy Your MCP Server</CardTitle>
          <CardDescription>Follow these steps to deploy your server to Vercel</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  Create Project Directory
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Create a new folder and copy all the downloaded files into it
                </p>
                <code className="block bg-muted px-3 py-2 rounded text-xs font-mono">
                  mkdir {config.domain.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-mcp
                  <br />
                  cd {config.domain.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-mcp
                </code>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Push to GitHub
                </h4>
                <p className="text-sm text-muted-foreground mb-2">Initialize git and push to GitHub</p>
                <code className="block bg-muted px-3 py-2 rounded text-xs font-mono">
                  git init
                  <br />
                  git add .
                  <br />
                  git commit -m "Initial MCP server"
                  <br />
                  git remote add origin YOUR_GITHUB_REPO
                  <br />
                  git push -u origin main
                </code>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Deploy to Vercel
                </h4>
                <p className="text-sm text-muted-foreground mb-2">Go to Vercel and import your GitHub repository</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 bg-transparent"
                  onClick={() => window.open("https://vercel.com/new", "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Vercel
                </Button>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold">
                4
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Get Your Manifest URL</h4>
                <p className="text-sm text-muted-foreground">After deployment, your manifest will be available at:</p>
                <code className="block mt-2 bg-muted px-3 py-2 rounded text-xs font-mono">
                  https://your-deployment.vercel.app/mcp-manifest.json
                </code>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-xl">Connect to ChatGPT</CardTitle>
          <CardDescription>After deployment, add your server to ChatGPT</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Open ChatGPT Settings</h4>
                <p className="text-sm text-muted-foreground">
                  Go to ChatGPT and click on your profile, then select "Settings"
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Navigate to MCP Servers</h4>
                <p className="text-sm text-muted-foreground">
                  Find the "Model Context Protocol" or "Trusted MCP" section
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Add Your Server</h4>
                <p className="text-sm text-muted-foreground">
                  Click "Add Server" and paste your manifest URL from Vercel
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold">
                4
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Start Using Your Data</h4>
                <p className="text-sm text-muted-foreground">
                  ChatGPT can now access your open data catalog through the MCP server!
                </p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      <div className="flex justify-center pt-4">
        <Button size="lg" variant="outline" onClick={() => window.location.reload()}>
          Create Another Server
        </Button>
      </div>
    </div>
  )
}
