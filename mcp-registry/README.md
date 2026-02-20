# MCP Registry Pattern

This example demonstrates how to integrate Kong Gateway with MCP (Model Context Protocol) server registries for dynamic tool discovery, and includes a complete AI agent implementation using the Volcano SDK.

## 🎯 Overview

The MCP Registry pattern enables:

1. **Dynamic Tool Discovery** - Connect to MCP server registries to discover available tools
2. **Secure Registry Access** - Use Kong's vault integration for credential management
3. **AI Agent Integration** - Build intelligent agents that search and use MCP tools

## 🏗️ Architecture

```
Volcano Agent (AI)
    ↓
Kong Gateway (localhost:8000)
    ↓
├── /mcp/registry → Kong Konnect MCP Registry
│   └── Upstream: https://klabs.us.api.konghq.com
│   └── Auth: Konnect Token (from vault)
│
└── /api/registry → Direct Registry API Access
    └── Upstream: https://klabs.us.api.konghq.com
```

## 📁 Components

```
mcp-registry/
├── kong-config/
│   └── kong.yaml           # Kong Gateway configuration
└── volcano-agent/          # AI agent using Volcano SDK
    ├── src/
    │   └── agent.ts        # Main agent implementation
    ├── package.json
    └── README.md
```

## 📋 Kong Configuration

### Services and Routes

1. **Registry API Service**
   - Upstream: `https://klabs.us.api.konghq.com`
   - Route: `/api/registry`
   - Direct API access with authentication

2. **Registry MCP Service**
   - Upstream: `https://host.docker.internal:8443`
   - Route: `/mcp/registry`
   - MCP tool interface for registry queries

### Vault Integration

The configuration uses Kong's Konnect vault for secure credential storage:

```yaml
vaults:
  - name: konnect
    prefix: kv
    config:
      config_store_id: a3a8af24-7515-4db1-a9d6-a4a169d4ea73
```

### Request Transformer Plugin

Automatically adds authentication headers from the vault:

```yaml
plugins:
  - name: request-transformer-advanced
    instance_name: registry-api-auth-headers
    route: registry-api-route
    config:
      add:
        headers:
          - "{vault://kv/KONNECT_TOKEN}"
```

### AI MCP Proxy Plugin

Exposes the registry as an MCP tool in conversion-listener mode:

```yaml
plugins:
  - name: ai-mcp-proxy
    instance_name: registry-mcp
    route: registry-mcp-route
    config:
      mode: conversion-listener
      logging:
        log_payloads: true
        log_statistics: true
      max_request_body_size: 16384
      tools:
        - annotations:
            title: MCP Registry Servers List
          description: Retrieve MCP servers in the registry.
          method: GET
          host: host.docker.internal
          path: /api/registry/v0/registries/{registry-id}/v0.1/servers
          scheme: https
```

**Key Features:**
- Converts registry API to MCP tool
- Enables tool discovery by AI agents
- Supports secure authentication
- Detailed logging for debugging

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for Volcano agent)
- OpenAI API key
- Kong Konnect account (for registry access)

### Setup Kong Gateway

1. **Configure Vault Credentials**

   Update the vault configuration in `kong-config/kong.yaml` with your Konnect credentials:
   - `config_store_id`: Your Konnect config store ID
   - Store your `KONNECT_TOKEN` in the vault

2. **Update Registry ID**

   Replace the registry ID in the MCP tool path:
   ```yaml
   path: /api/registry/v0/registries/YOUR-REGISTRY-ID/v0.1/servers
   ```

3. **Start Kong Gateway**

   ```bash
   docker run -d --name kong-mcp-registry \
     -v $(pwd)/kong-config:/kong/declarative \
     -e "KONG_DATABASE=off" \
     -e "KONG_DECLARATIVE_CONFIG=/kong/declarative/kong.yaml" \
     -e "KONG_PROXY_LISTEN=0.0.0.0:8000" \
     -e "KONG_ADMIN_LISTEN=0.0.0.0:8001" \
     -p 8000:8000 \
     -p 8001:8001 \
     kong/kong-gateway:latest
   ```

### Setup Volcano Agent

The Volcano Agent is a TypeScript application that demonstrates how to:
- Search for MCP servers in a registry
- Connect to discovered MCP servers
- Invoke tools on MCP servers
- Build AI-powered workflows

It includes both a **CLI interface** and a **Web UI** with a beautiful dark theme featuring Kong's signature lime green branding.

See [volcano-agent/README.md](volcano-agent/README.md) for detailed setup and usage instructions.

Quick start (Web UI - Recommended):
```bash
cd volcano-agent
npm install
npm run ui
# Open http://localhost:3000 in your browser
```

Quick start (CLI):
```bash
cd volcano-agent
npm install
export OPENAI_API_KEY="your-api-key-here"
npm run dev -- -p "Tell me a Chuck Norris joke"
```

## 🔍 Usage Examples

### Test Registry API Access

Query the registry directly:
```bash
curl http://localhost:8000/api/registry/v0/registries/{registry-id}/v0.1/servers
```

### Use the Volcano Agent

Get a Chuck Norris joke:
```bash
cd volcano-agent
npm run dev -- --topic career
```

Search for GitHub issues servers:
```bash
npm run dev -- --search-type github-issues
```

Enable debug logging:
```bash
npm run dev -- --debug
```

## 🤖 Volcano Agent Features

The included AI agent demonstrates:

- **MCP Server Discovery** - Search registries for specific tools
- **Dynamic Tool Invocation** - Connect to and use discovered MCP servers
- **Structured Outputs** - Use JSON schemas for reliable responses
- **Error Handling** - Graceful failure recovery
- **CLI Interface** - Easy command-line usage
- **Debug Mode** - Detailed logging for troubleshooting
- **Web UI** - Modern dark-themed interface with Kong 2026 branding (neon lime green)
- **Markdown Rendering** - Full markdown support for rich responses

## 📊 Use Cases

1. **Tool Discovery** - Find MCP servers that provide specific capabilities
2. **Dynamic Integration** - Connect to new tools without code changes
3. **AI Workflows** - Build agents that discover and chain multiple tools
4. **Service Catalog** - Maintain a registry of available AI tools
5. **Multi-Provider** - Access tools from different MCP server providers

## 🔧 Customization

### Adding Custom Registries

To connect to additional MCP registries:

1. Add a new service and route in `kong.yaml`
2. Configure authentication (if required)
3. Add the `ai-mcp-proxy` plugin with appropriate tool definitions
4. Update the Volcano agent to use the new registry URL

### Extending the Agent

The Volcano agent can be extended to:
- Support additional MCP servers
- Implement custom workflows
- Add new search capabilities
- Integrate with other AI models

## 🔐 Security Considerations

- **Vault Integration** - Store sensitive credentials in Kong's vault
- **Authentication** - Use request transformer to add auth headers
- **HTTPS** - Use secure connections to registries
- **Access Control** - Implement rate limiting and access policies

## 📚 Related Examples

- [MCP Proxy Pattern](../mcp-proxy/README.md) - Convert REST APIs to MCP tools
- [Basic Example](../example/README.md) - Simple Kong AI Gateway usage

## 🔗 Resources

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Volcano SDK](https://github.com/volcano-sh/volcano-sdk)
- [Kong Konnect](https://konghq.com/products/kong-konnect)
- [Kong Vault Documentation](https://docs.konghq.com/gateway/latest/kong-enterprise/secrets-management/)

