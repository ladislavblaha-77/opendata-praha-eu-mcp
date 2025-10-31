import { createMcpHandler } from "mcp-handler"
import { z } from "zod"

export const maxDuration = 60

async function fetchJsonData(url: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const data = await response.json()
  return data
}

const handler = createMcpHandler(
  (server) => {
    server.tool(
      "get_catalog",
      "Vrací základní metadata katalogu otevřených dat MHMP (DCAT-AP-CZ) ve formátu JSON.",
      {},
      async (params, { request }) => {
        try {
          const url = new URL(request.url)
          const apiUrl =
            url.searchParams.get("apiUrl") || "https://api.opendata.praha.eu/lod/catalog?format=json&publishers[]=mhmp"

          const data = await fetchJsonData(apiUrl)

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
      "Vrací seznam všech datových sad publikovaných MHMP (včetně názvů, IRI a popisu).",
      {
        limit: z.number().optional().describe("Maximální počet výsledků"),
        offset: z.number().optional().describe("Offset pro stránkování"),
      },
      async ({ limit, offset }, { request }) => {
        try {
          let datasetUrl = "https://api.opendata.praha.eu/lod/catalog?format=json&publishers[]=mhmp"

          if (limit) datasetUrl += `&limit=${limit}`
          if (offset) datasetUrl += `&offset=${offset}`

          const data = await fetchJsonData(datasetUrl)

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
      "get_dataset_by_iri",
      "Získá detailní informace o konkrétní datové sadě pomocí jejího IRI.",
      {
        iri: z.string().describe("IRI (URL) datové sady"),
      },
      async ({ iri }, { request }) => {
        try {
          const datasetUrl = iri.includes("?") ? `${iri}&format=json` : `${iri}?format=json`

          const data = await fetchJsonData(datasetUrl)

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

          const result = await fetchJsonData(searchUrl)

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    count: result.result?.count || 0,
                    datasets:
                      result.result?.results?.map((pkg: any) => ({
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

          const result = await fetchJsonData(detailUrl)

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    id: result.result?.id,
                    name: result.result?.name,
                    title: result.result?.title,
                    notes: result.result?.notes,
                    organization: result.result?.organization?.title,
                    tags: result.result?.tags?.map((t: any) => t.name),
                    resources: result.result?.resources?.map((r: any) => ({
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

          const result = await fetchJsonData(listUrl)

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    datasets: result.result || [],
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
    description: "MCP server pro přístup k otevřeným datům přes LKOD API (stabilní JSON verze)",
  },
  { basePath: "/api" },
)

export { handler as GET, handler as POST, handler as DELETE }
