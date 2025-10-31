import { createMcpHandler } from "mcp-handler"
import { z } from "zod"

export const maxDuration = 60

const handler = createMcpHandler(
  (server) => {
    server.tool(
      "get_catalog",
      "Vrací základní metadata katalogu otevřených dat MHMP (DCAT-AP-CZ)",
      {},
      async (params, { request }) => {
        try {
          const url = new URL(request.url)
          const apiUrl =
            url.searchParams.get("apiUrl") || "https://api.opendata.praha.eu/lod/catalog?publishers%5B%5D=mhmp"

          const response = await fetch(apiUrl)
          const data = await response.json()

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(data, null, 2),
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

    server.tool(
      "get_dataset_list",
      "Vrací seznam všech datových sad publikovaných MHMP (včetně názvů, IRI a popisu)",
      {
        limit: z.number().optional().describe("Maximální počet výsledků"),
        offset: z.number().optional().describe("Offset pro stránkování"),
      },
      async ({ limit, offset }, { request }) => {
        try {
          const url = new URL(request.url)
          let datasetUrl = "https://api.opendata.praha.eu/lod/dataset?publisher=mhmp"

          if (limit) datasetUrl += `&limit=${limit}`
          if (offset) datasetUrl += `&offset=${offset}`

          const response = await fetch(datasetUrl)
          const data = await response.json()

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(data, null, 2),
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

    // Tool 1: Search datasets
    server.tool(
      "search_datasets",
      "Vyhledá datasety v LKOD katalogu podle klíčových slov",
      {
        query: z.string().describe("Vyhledávací dotaz (název datasetu, klíčová slova)"),
        limit: z.number().default(10).describe("Maximální počet výsledků"),
      },
      async ({ query, limit }, { request }) => {
        try {
          const url = new URL(request.url)
          const apiUrl = url.searchParams.get("apiUrl") || "https://api.opendata.praha.eu/lod/catalog"

          const searchUrl = `${apiUrl}/action/package_search?q=${encodeURIComponent(query)}&rows=${limit}`
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
      async ({ id }, { request }) => {
        try {
          const url = new URL(request.url)
          const apiUrl = url.searchParams.get("apiUrl") || "https://api.opendata.praha.eu/lod/catalog"

          const detailUrl = `${apiUrl}/action/package_show?id=${encodeURIComponent(id)}`
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
      async ({ limit, offset }, { request }) => {
        try {
          const url = new URL(request.url)
          const apiUrl = url.searchParams.get("apiUrl") || "https://api.opendata.praha.eu/lod/catalog"

          const listUrl = `${apiUrl}/action/package_list?limit=${limit}&offset=${offset}`
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
    name: "LKOD MCP Server",
    version: "1.0.0",
    description: "MCP server pro přístup k otevřeným datům přes LKOD API",
  },
  { basePath: "/api" },
)

export { handler as GET, handler as POST, handler as DELETE }
