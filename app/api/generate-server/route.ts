import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const config = await request.json()
    const actions = config.actions.split(",").map((a) => a.trim())

    // Generate server.js file
    const serverCode = `import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

const API_BASE_URL = "${config.apiUrl}";
const API_TYPE = "${config.apiType}";

// Create MCP server
const server = new Server(
  {
    name: "${config.serverName}",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: actions.map((action, index) => ({
      name: \`action_\${index + 1}\`,
      description: action,
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query or parameter"
          }
        }
      }
    }))
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    // Make API request based on configuration
    const response = await fetch(\`\${API_BASE_URL}?q=\${args.query || ''}\`);
    const data = await response.json();
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2)
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: \`Error: \${error.message}\`
        }
      ],
      isError: true
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("${config.serverName} MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
`

    // Generate package.json
    const packageJson = {
      name: config.domain.replace(/[^a-z0-9]/gi, "-").toLowerCase(),
      version: "1.0.0",
      description: config.serverDescription,
      type: "module",
      main: "server.js",
      scripts: {
        start: "node server.js",
      },
      dependencies: {
        "@modelcontextprotocol/sdk": "^1.0.0",
        "node-fetch": "^3.3.2",
      },
      author: config.contactEmail,
    }

    // Generate manifest
    const manifest = {
      name: config.serverName,
      description: config.serverDescription,
      version: "1.0.0",
      api: {
        url: config.apiUrl,
        type: config.apiType,
      },
      contact: {
        email: config.contactEmail,
      },
      domain: config.domain,
      capabilities: actions.map((action) => action.trim()),
    }

    // Generate README
    const readme = `# ${config.serverName}

${config.serverDescription}

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

This MCP server connects to: ${config.apiUrl}

### Running locally

\`\`\`bash
npm start
\`\`\`

### Deploying to Vercel

1. Install Vercel CLI: \`npm i -g vercel\`
2. Run: \`vercel\`
3. Follow the prompts to deploy

### Connecting to ChatGPT

Add this manifest URL to ChatGPT's MCP settings:
\`https://your-deployment-url.vercel.app/mcp-manifest.json\`

## API Configuration

- **API URL**: ${config.apiUrl}
- **API Type**: ${config.apiType}
- **Domain**: ${config.domain}

## Actions

${actions.map((action, i) => `${i + 1}. ${action}`).join("\n")}

## Contact

${config.contactEmail}
`

    // Generate vercel.json for proper routing
    const vercelConfig = {
      version: 2,
      builds: [
        {
          src: "server.js",
          use: "@vercel/node",
        },
      ],
      routes: [
        {
          src: "/mcp-manifest.json",
          dest: "/manifest.json",
        },
      ],
    }

    return NextResponse.json({
      files: {
        "server.js": serverCode,
        "package.json": JSON.stringify(packageJson, null, 2),
        "manifest.json": JSON.stringify(manifest, null, 2),
        "README.md": readme,
        "vercel.json": JSON.stringify(vercelConfig, null, 2),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate server files" }, { status: 500 })
  }
}
