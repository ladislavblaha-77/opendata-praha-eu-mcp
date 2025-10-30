import { createMCPHandler } from "mcp-handler"
import { z } from "zod"

export const maxDuration = 60

export const GET = async (request: Request, { params }: { params: Promise<{ config: string }> }) => {
  const { config } = await params

  let decodedConfig
  try {
    decodedConfig = JSON.parse(decodeURIComponent(config))
  } catch (error) {
    return new Response("Invalid configuration", { status: 400 })
  }

  const { apiUrl, name, description } = decodedConfig

  const handler = createMCPHandler({
    name: name || "LKOD MCP Server",
    version: "1.0.0",
    description: description || "MCP server pro přístup k otevřeným datům přes LKOD API",
    tools: {
      search_datasets: {
        description: "Vyhledá datasety v LKOD katalogu podle klíčových slov",
        parameters: z.object({
          query: z.string().describe("Vyhledávací dotaz (název datasetu, klíčová slova)"),
          limit: z.number().default(10).describe("Maximální počet výsledků"),
        }),
        execute: async ({ query, limit }) => {
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
      },
      get_dataset: {
        description: "Získá detailní informace o konkrétním datasetu",
        parameters: z.object({
          id: z.string().describe("ID datasetu"),
        }),
        execute: async ({ id }) => {
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
      },
      list_datasets: {
        description: "Vypíše všechny dostupné datasety",
        parameters: z.object({
          limit: z.number().default(20).describe("Maximální počet výsledků"),
          offset: z.number().default(0).describe("Offset pro stránkování"),
        }),
        execute: async ({ limit, offset }) => {
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
      },
    },
  })

  return handler(request)
}

export const POST = GET
