import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ config: string }> }) {
  try {
    const { config } = await params

    // Decode configuration from URL
    const decodedConfig = JSON.parse(atob(config))
    const { apiUrl, name, description } = decodedConfig

    // Generate MCP manifest
    const manifest = {
      name: name || "LKOD MCP Server",
      description: description || "MCP server pro přístup k otevřeným datům přes LKOD API",
      version: "1.0.0",
      protocol: "mcp/v1",
      capabilities: {
        tools: true,
      },
      tools: [
        {
          name: "search_datasets",
          description: "Vyhledá datasety v LKOD katalogu podle klíčových slov",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Vyhledávací dotaz (název datasetu, klíčová slova)",
              },
              limit: {
                type: "number",
                description: "Maximální počet výsledků (výchozí: 10)",
                default: 10,
              },
            },
            required: ["query"],
          },
        },
        {
          name: "get_dataset",
          description: "Získá detailní informace o konkrétním datasetu",
          inputSchema: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "ID datasetu",
              },
            },
            required: ["id"],
          },
        },
        {
          name: "list_datasets",
          description: "Vypíše všechny dostupné datasety",
          inputSchema: {
            type: "object",
            properties: {
              limit: {
                type: "number",
                description: "Maximální počet výsledků (výchozí: 20)",
                default: 20,
              },
              offset: {
                type: "number",
                description: "Offset pro stránkování (výchozí: 0)",
                default: 0,
              },
            },
          },
        },
      ],
      metadata: {
        apiUrl,
        createdAt: new Date().toISOString(),
      },
    }

    return NextResponse.json(manifest, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("[v0] Error generating manifest:", error)
    return NextResponse.json({ error: "Invalid configuration" }, { status: 400 })
  }
}
