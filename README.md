# Kong MCP Gateway Examples

This repository demonstrates how to use Kong Gateway with the Model Context Protocol (MCP) to expose APIs and services as AI-accessible tools. It showcases two main patterns for integrating MCP with Kong Gateway.

## 🎯 Overview

The Model Context Protocol (MCP) is an open standard that enables AI applications to securely connect to external data sources and tools. This repository provides practical examples of using Kong Gateway's `ai-mcp-proxy` plugin to:

- **Convert REST APIs to MCP tools** - Transform existing HTTP APIs into MCP-compatible tools that AI agents can discover and use
- **Proxy MCP registries** - Connect to MCP server registries for dynamic tool discovery
- **Build AI agents** - Create intelligent agents that leverage MCP tools through Kong Gateway

## 📁 Repository Structure

```
kong-mcp-gateway-examples/
├── mcp-proxy/          # MCP proxy pattern examples
│   ├── kong-config/    # Kong Gateway configuration
│   └── openapi.yaml    # Chuck Norris API OpenAPI specification
├── mcp-registry/       # MCP registry integration examples
│   ├── kong-config/    # Kong Gateway configuration
│   └── volcano-agent/  # AI agent using Volcano SDK
│       ├── src/        # TypeScript source files
│       │   ├── agent.ts      # CLI implementation
│       │   └── server.ts     # Web UI server
│       ├── public/     # Web UI frontend (dark theme)
│       └── package.json
└── example/            # Basic Kong AI Gateway usage
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for the Volcano agent)
- Python 3.8+ (for the basic example)
- OpenAI API key

### Environment Setup

Set your OpenAI API key:
```bash
export OPENAI_API_KEY="your-api-key-here"
```

## 📚 Examples

### 1. MCP Proxy Pattern (`mcp-proxy/`)

Demonstrates how to expose REST APIs as MCP tools using Kong Gateway's `ai-mcp-proxy` plugin in **conversion-listener** mode.

**Use Cases:**
- Convert existing REST APIs to MCP tools
- Expose third-party APIs (like Chuck Norris API) to AI agents
- Proxy remote MCP servers

**Key Features:**
- Automatic REST-to-MCP conversion
- Tool discovery and invocation
- Request/response logging
- Passthrough mode for existing MCP servers

See [mcp-proxy/README.md](mcp-proxy/README.md) for detailed setup and usage.

### 2. MCP Registry Pattern (`mcp-registry/`)

Shows how to integrate with MCP server registries for dynamic tool discovery and includes a Volcano SDK-based AI agent.

**Use Cases:**
- Connect to MCP server registries
- Dynamic tool discovery
- Build AI agents that search and use MCP tools
- Secure registry access with authentication

**Components:**
- Kong configuration for registry access
- Volcano Agent - TypeScript AI agent using the Volcano SDK
  - **CLI Mode**: Command-line interface for quick scripting
  - **Web UI Mode**: Dark-themed web interface with Kong 2026 branding (neon lime green)
- Integration with Konnect for secure credential management

See [mcp-registry/README.md](mcp-registry/README.md) for detailed setup and usage.

### 3. Basic Example (`example/`)

Simple Python example demonstrating Kong AI Gateway usage with OpenAI client.

See [example/README.md](example/README.md) for setup instructions.

## 🔧 Kong AI MCP Proxy Plugin

The `ai-mcp-proxy` plugin is the core component that enables MCP integration. It supports two modes:

### Conversion-Listener Mode
Converts REST API endpoints into MCP tools by defining tool schemas in the Kong configuration.

```yaml
plugins:
- name: ai-mcp-proxy
  config:
    mode: conversion-listener
    tools:
    - description: Retrieve a random joke
      method: GET
      path: /api/jokes/random
```

### Passthrough-Listener Mode
Proxies requests to existing MCP servers without modification.

```yaml
plugins:
- name: ai-mcp-proxy
  config:
    mode: passthrough-listener
```

## 🏗️ Architecture

```
AI Agent (OpenAI/Anthropic)
    ↓
Kong Gateway (ai-mcp-proxy plugin)
    ↓
├── REST APIs (converted to MCP tools)
├── MCP Servers (proxied)
└── MCP Registries (for tool discovery)
```

## 📖 Learn More

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Kong Gateway Documentation](https://docs.konghq.com/)
- [Kong AI Gateway](https://konghq.com/products/kong-ai-gateway)
- [Volcano SDK](https://github.com/volcano-sh/volcano-sdk)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📄 License

This project is provided as-is for demonstration purposes.

## 🆘 Support

For questions or issues:
- Kong Gateway: [Kong Community](https://discuss.konghq.com/)
- MCP Protocol: [MCP GitHub](https://github.com/modelcontextprotocol)

