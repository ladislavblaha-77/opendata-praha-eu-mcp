import { createMcpHandler } from "mcp-handler"
import { z } from "zod"

export const maxDuration = 60

async function fetchAndFlattenJsonLd(url: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/ld+json, application/json",
    },
  })

  const contentType = response.headers.get("content-type") || ""
  const data = await response.json()

  // Check if response is JSON-LD
  const isJsonLd = contentType.includes("application/ld+json") || data["@context"] || data["@graph"]

  if (isJsonLd) {
    console.log("[v0] Detected JSON-LD response, flattening...")
    return {
      data: flattenJsonLd(data),
      isJsonLd: true,
      originalFormat: "application/ld+json",
    }
  }

  return {
    data,
    isJsonLd: false,
    originalFormat: contentType,
  }
}

function flattenJsonLd(jsonld: any): any {
  // If it's an array, flatten each item
  if (Array.isArray(jsonld)) {
    return jsonld.map((item) => flattenJsonLd(item))
  }

  // If it's not an object, return as is
  if (typeof jsonld !== "object" || jsonld === null) {
    return jsonld
  }

  const flattened: any = {}

  // Handle @graph
  if (jsonld["@graph"]) {
    return flattenJsonLd(jsonld["@graph"])
  }

  // Process each key
  for (const [key, value] of Object.entries(jsonld)) {
    // Skip @context
    if (key === "@context") continue

    // Rename @id to iri
    if (key === "@id") {
      flattened.iri = value
      continue
    }

    // Rename @type to type
    if (key === "@type") {
      flattened.type = value
      continue
    }

    // Handle multilingual strings (e.g., {"cs": "text"})
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const keys = Object.keys(value)
      if (keys.length === 1 && typeof value[keys[0]] === "string") {
        flattened[key] = value[keys[0]]
        continue
      }
    }

    // Recursively flatten nested objects and arrays
    if (typeof value === "object" && value !== null) {
      flattened[key] = flattenJsonLd(value)
    } else {
      flattened[key] = value
    }
  }

  return flattened
}

const handler = createMcpHandler(
  (server) => {
    server.tool(
      "get_catalog",
      "Vrací základní metadata katalogu otevřených dat MHMP (DCAT-AP-CZ). Automaticky detekuje a zpracovává JSON-LD formát.",
      {},
      async (params, { request }) => {
        try {
          const url = new URL(request.url)
          const apiUrl =
            url.searchParams.get("apiUrl") || "https://api.opendata.praha.eu/lod/catalog?publishers%5B%5D=mhmp"

          const result = await fetchAndFlattenJsonLd(apiUrl)

          const responseText = JSON.stringify(result.data, null, 2)
          const warning = result.isJsonLd
            ? "\n\n⚠️ Odpověď byla automaticky převedena z JSON-LD do běžného JSON formátu."
            : ""

          return {
            content: [
              {
                type: "text" as const,
                text: responseText + warning,
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
      "Vrací seznam všech datových sad publikovaných MHMP (včetně názvů, IRI a popisu). Automaticky zpracovává JSON-LD.",
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

          const result = await fetchAndFlattenJsonLd(datasetUrl)

          const responseText = JSON.stringify(result.data, null, 2)
          const warning = result.isJsonLd
            ? "\n\n⚠️ Odpověď byla automaticky převedena z JSON-LD do běžného JSON formátu."
            : ""

          return {
            content: [
              {
                type: "text" as const,
                text: responseText + warning,
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
      "Získá detailní informace o konkrétní datové sadě pomocí jejího IRI. Automaticky zpracovává JSON-LD.",
      {
        iri: z.string().describe("IRI (URL) datové sady"),
      },
      async ({ iri }, { request }) => {
        try {
          const result = await fetchAndFlattenJsonLd(iri)

          const responseText = JSON.stringify(result.data, null, 2)
          const warning = result.isJsonLd
            ? "\n\n⚠️ Odpověď byla automaticky převedena z JSON-LD do běžného JSON formátu."
            : ""

          return {
            content: [
              {
                type: "text" as const,
                text: responseText + warning,
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

          const result = await fetchAndFlattenJsonLd(searchUrl)

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    count: result.data.result?.count || 0,
                    datasets:
                      result.data.result?.results?.map((pkg: any) => ({
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

          const result = await fetchAndFlattenJsonLd(detailUrl)

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    id: result.data.result?.id,
                    name: result.data.result?.name,
                    title: result.data.result?.title,
                    notes: result.data.result?.notes,
                    organization: result.data.result?.organization?.title,
                    tags: result.data.result?.tags?.map((t: any) => t.name),
                    resources: result.data.result?.resources?.map((r: any) => ({
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

          const result = await fetchAndFlattenJsonLd(listUrl)

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    datasets: result.data.result || [],
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
    description: "MCP server pro přístup k otevřeným datům přes LKOD API s automatickou podporou JSON-LD",
  },
  { basePath: "/api" },
)

export { handler as GET, handler as POST, handler as DELETE }
