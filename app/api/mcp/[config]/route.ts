import { createMcpHandler } from "mcp-handler"
import { z } from "zod"

export const maxDuration = 60

const createHandler = async (config: string) => {
  let decodedConfig
  try {
    decodedConfig = JSON.parse(decodeURIComponent(config))
  } catch (error) {
    return null
  }

  const { apiUrl, name, description } = decodedConfig

  const handler = createMcpHandler(
    (server) => {
      // Tool 1: Search datasets
      server.tool(
        "search_datasets",
        "Vyhledá datasety v LKOD katalogu podle klíčových slov",
        {
          query: z.string().describe("Vyhledávací dotaz (název datasetu, klíčová slova)"),
          limit: z.number().default(10).describe("Maximální počet výsledků"),
        },
        async ({ query, limit }) => {
          try {
            const searchUrl = `${apiUrl}package_search?q=${encodeURIComponent(query)}&rows=${limit}`
            const response = await fetch(searchUrl)
            const data = await response.json()

            return {
              content: [
                {
                  type: "text" as const,
                  text: JSON.stringify(
                    {
                      count: data.result?.count || 0,
                      datasets:
                        data.result?.results?.map((pkg: any) => ({
                          id: pkg.id,
                          name: pkg.name,
                          title: pkg.title,
                          notes: pkg.notes,
                          organization: pkg.organization?.title,
                          tags: pkg.tags?.map((t: any) => t.name),
                        })) || [],
                    },
                    null,
                    2,
                  ),
                },
              ],
            }
          } catch (error) {
            return {
              content: [
                {
                  type: "text" as const,
                  text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
              ],
              isError: true,
            }
          }
        },
      )

      // Tool 2: Get dataset details
      server.tool(
        "get_dataset",
        "Získá detailní informace o konkrétním datasetu",
        {
          id: z.string().describe("ID datasetu"),
        },
        async ({ id }) => {
          try {
            const detailUrl = `${apiUrl}package_show?id=${encodeURIComponent(id)}`
            const response = await fetch(detailUrl)
            const data = await response.json()

            return {
              content: [
                {
                  type: "text" as const,
                  text: JSON.stringify(
                    {
                      id: data.result?.id,
                      name: data.result?.name,
                      title: data.result?.title,
                      notes: data.result?.notes,
                      organization: data.result?.organization?.title,
                      tags: data.result?.tags?.map((t: any) => t.name),
                      resources: data.result?.resources?.map((r: any) => ({
                        id: r.id,
                        name: r.name,
                        format: r.format,
                        url: r.url,
                        description: r.description,
                      })),
                    },
                    null,
                    2,
                  ),
                },
              ],
            }
          } catch (error) {
            return {
              content: [
                {
                  type: "text" as const,
                  text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
              ],
              isError: true,
            }
          }
        },
      )

      // Tool 3: List datasets
      server.tool(
        "list_datasets",
        "Vypíše všechny dostupné datasety",
        {
          limit: z.number().default(20).describe("Maximální počet výsledků"),
          offset: z.number().default(0).describe("Offset pro stránkování"),
        },
        async ({ limit, offset }) => {
          try {
            const listUrl = `${apiUrl}package_list?limit=${limit}&offset=${offset}`
            const response = await fetch(listUrl)
            const data = await response.json()

            return {
              content: [
                {
                  type: "text" as const,
                  text: JSON.stringify(
                    {
                      datasets: data.result || [],
                    },
                    null,
                    2,
                  ),
                },
              ],
            }
          } catch (error) {
            return {
              content: [
                {
                  type: "text" as const,
                  text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
              ],
              isError: true,
            }
          }
        },
      )
    },
    {
      name: name || "LKOD MCP Server",
      version: "1.0.0",
      description: description || "MCP server pro přístup k otevřeným datům přes LKOD API",
    },
    { basePath: "/api/mcp" },
  )

  return handler
}

export const GET = async (request: Request, { params }: { params: Promise<{ config: string }> }) => {
  const { config } = await params
  const handler = await createHandler(config)

  if (!handler) {
    return new Response("Invalid configuration", { status: 400 })
  }

  return handler(request)
}

export const POST = GET
export const DELETE = GET
