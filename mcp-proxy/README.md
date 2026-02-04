# MCP Proxy Pattern

This example demonstrates how to use Kong Gateway's `ai-mcp-proxy` plugin to expose REST APIs as MCP (Model Context Protocol) tools that AI agents can discover and invoke.

## 🎯 Overview

The MCP Proxy pattern shows two key capabilities:

1. **REST API to MCP Conversion** - Transform existing REST APIs into MCP tools using the `conversion-listener` mode
2. **MCP Server Passthrough** - Proxy existing MCP servers using the `passthrough-listener` mode

## 🏗️ Architecture

```
AI Agent
    ↓
Kong Gateway (localhost:8000)
    ↓
├── /mcp/chucknorris → Chuck Norris API (converted to MCP)
│   └── Upstream: https://api.chucknorris.io
│
└── /mcp/fetch → Remote MCP Server (passthrough)
    └── Upstream: https://remote.mcpservers.org/fetch/mcp
```

## 📋 Configuration

The Kong configuration (`kong-config/kong.yaml`) defines:

### Services and Routes

1. **Chuck Norris Service**
   - Upstream: `https://api.chucknorris.io`
   - Route: `/api/chucknorris`
   - Direct REST API access

2. **Chuck Norris MCP Service**
   - Upstream: `http://host.docker.internal:8000`
   - Route: `/mcp/chucknorris`
   - MCP tool interface (conversion mode)

3. **Fetch MCP Service**
   - Upstream: `https://remote.mcpservers.org/fetch/mcp`
   - Route: `/mcp/fetch`
   - MCP server passthrough

### AI MCP Proxy Plugin Configuration

#### Conversion-Listener Mode (Chuck Norris)

Converts the Chuck Norris REST API into an MCP tool:

```yaml
plugins:
- name: ai-mcp-proxy
  route: chucknorris-mcp
  config:
    mode: conversion-listener
    logging:
      log_payloads: true
      log_statistics: true
    max_request_body_size: 16384
    tools:
    - annotations:
        title: Chuck Norris Random Joke
      description: Retrieve a random chuck joke in JSON format.
      method: GET
      path: /api/chucknorris/jokes/random
      parameters:
      - name: category
        in: query
        required: false
        description: Retrieve a random chuck norris joke from a given category.
        schema:
          type: string
```

**Key Features:**
- Defines tool schema for AI agents
- Maps REST endpoint to MCP tool
- Supports query parameters
- Enables payload and statistics logging

#### Passthrough-Listener Mode (Fetch MCP)

Proxies an existing MCP server without modification:

```yaml
plugins:
- name: ai-mcp-proxy
  route: fetch-mcp-route
  config:
    mode: passthrough-listener
    logging:
      log_payloads: true
      log_statistics: true
    max_request_body_size: 1048576
```

**Key Features:**
- Direct MCP protocol passthrough
- No tool schema definition needed
- Larger request body support (1MB)
- Full MCP protocol compatibility

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- Kong Gateway with AI MCP Proxy plugin
- OpenAI API key (for testing with AI agents)

### Setup

1. **Start Kong Gateway**

   Deploy Kong with the configuration:
   ```bash
   docker run -d --name kong-mcp-proxy \
     -v $(pwd)/kong-config:/kong/declarative \
     -e "KONG_DATABASE=off" \
     -e "KONG_DECLARATIVE_CONFIG=/kong/declarative/kong.yaml" \
     -e "KONG_PROXY_LISTEN=0.0.0.0:8000" \
     -e "KONG_ADMIN_LISTEN=0.0.0.0:8001" \
     -p 8000:8000 \
     -p 8001:8001 \
     kong/kong-gateway:latest
   ```

2. **Verify Configuration**

   Check that Kong is running:
   ```bash
   curl http://localhost:8001/status
   ```

### Usage

#### Test REST API Access

Access the Chuck Norris API directly:
```bash
curl http://localhost:8000/api/chucknorris/jokes/random
```

With a category:
```bash
curl "http://localhost:8000/api/chucknorris/jokes/random?category=dev"
```

#### Test MCP Tool Access

The MCP endpoints are designed to be accessed by AI agents using the MCP protocol. You can test them with:

1. **MCP Client Libraries** - Use official MCP SDKs
2. **AI Agents** - Configure agents to use `http://localhost:8000/mcp/chucknorris`
3. **Volcano SDK** - See the `mcp-registry/volcano-agent` example

## 🔍 Monitoring and Debugging

### View Logs

The plugin is configured with detailed logging:
- `log_payloads: true` - Logs request/response payloads
- `log_statistics: true` - Logs performance metrics

View Kong logs:
```bash
docker logs kong-mcp-proxy -f
```

### Inspect Configuration

Check loaded routes and services:
```bash
curl http://localhost:8001/routes
curl http://localhost:8001/services
curl http://localhost:8001/plugins
```

## 📊 Use Cases

1. **Legacy API Integration** - Expose existing REST APIs to AI agents without modification
2. **API Aggregation** - Combine multiple REST APIs into a unified MCP interface
3. **MCP Gateway** - Centralize access to multiple MCP servers
4. **Tool Discovery** - Provide a catalog of tools for AI agents

## 🔧 Customization

### Adding New Tools

To expose additional REST APIs as MCP tools:

1. Add a new service and route in `kong.yaml`
2. Configure the `ai-mcp-proxy` plugin with tool definitions
3. Reload Kong configuration

### Adjusting Request Limits

Modify `max_request_body_size` based on your API requirements:
- Small payloads: `16384` (16KB)
- Large payloads: `1048576` (1MB)
- Custom size: Any value in bytes

## 📚 Related Examples

- [MCP Registry Pattern](../mcp-registry/README.md) - Dynamic tool discovery with registries
- [Volcano Agent](../mcp-registry/volcano-agent/README.md) - AI agent using MCP tools

## 🔗 Resources

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Kong AI MCP Proxy Plugin Documentation](https://docs.konghq.com/hub/kong-inc/ai-mcp-proxy/)
- [Chuck Norris API](https://api.chucknorris.io/)

