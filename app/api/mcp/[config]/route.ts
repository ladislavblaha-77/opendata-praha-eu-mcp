import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ config: string }> }) {
  try {
    const { config } = await params
    const body = await request.json()

    const decodedConfig = JSON.parse(decodeURIComponent(config))
    const { apiUrl } = decodedConfig

    const { tool, arguments: args } = body

    console.log("[v0] MCP tool call:", tool, args)

    // Handle different tool calls
    switch (tool) {
      case "search_datasets": {
        const { query, limit = 10 } = args

        // Call LKOD API to search datasets
        const searchUrl = `${apiUrl}package_search?q=${encodeURIComponent(query)}&rows=${limit}`
        const response = await fetch(searchUrl)
        const data = await response.json()

        return NextResponse.json({
          success: true,
          result: {
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
        })
      }

      case "get_dataset": {
        const { id } = args

        // Call LKOD API to get dataset details
        const detailUrl = `${apiUrl}package_show?id=${encodeURIComponent(id)}`
        const response = await fetch(detailUrl)
        const data = await response.json()

        return NextResponse.json({
          success: true,
          result: {
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
        })
      }

      case "list_datasets": {
        const { limit = 20, offset = 0 } = args

        // Call LKOD API to list datasets
        const listUrl = `${apiUrl}package_list?limit=${limit}&offset=${offset}`
        const response = await fetch(listUrl)
        const data = await response.json()

        return NextResponse.json({
          success: true,
          result: {
            datasets: data.result || [],
          },
        })
      }

      default:
        return NextResponse.json({ success: false, error: "Unknown tool" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] Error handling MCP request:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
