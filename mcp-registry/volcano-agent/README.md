# Volcano Agent

A simple Node.js application using the Volcano SDK that automatically finds the right MCP server for your request and executes it. Features both a CLI interface and a modern dark-themed web UI with Kong branding.

## Features

- 🔍 **Automatic MCP Server Discovery**: Automatically searches for appropriate MCP servers based on your request
- 💬 **Single Prompt Interface**: Just tell it what you want - no need to specify search and action separately
- 🎯 **Smart Execution**: Finds the right server and executes your request automatically
- 🛠️ **Simple CLI**: One prompt, that's all you need
- 🔧 **Debug Mode**: Optional detailed logging
- 🌐 **Modern Web UI**: Beautiful dark-themed interface with Kong 2026 branding (neon lime green on black)
- 📝 **Markdown Rendering**: Responses are rendered with full markdown support including code blocks, tables, and links
- 💾 **Persistent Configuration**: Save your settings in browser local storage

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. (Optional) Set your OpenAI API key for CLI usage:
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   ```

## Usage

### Web UI (Recommended)

The Web UI provides the easiest way to use the agent with a beautiful dark-themed interface:

```bash
# Run in development mode
npm run ui

# Or build and run the compiled version
npm run ui:build
```

Then open your browser to `http://localhost:3000`

#### Web UI Features

- **Dark Theme**: High-contrast dark interface with Kong's signature lime green (#CAFE00) accents
- **Markdown Rendering**: All responses are rendered with full markdown support
- **Configuration Panel**: Set all options through the UI:
  - OpenAI API Key (required)
  - Registry URL (required)
  - OpenAI Base URL (optional)
  - OpenAI Model (optional, defaults to gpt-4o-mini)
- **Save Configuration**: Store settings in browser local storage
- **Debug Mode**: Toggle detailed logging
- **Example Prompts**: Quick buttons for common requests
- **Real-time Results**: See which MCP server was used with formatted response

#### Benefits of Web UI

- No environment variables or command line arguments needed
- Visual feedback and error handling
- Persistent configuration storage
- Beautiful Kong-branded dark theme
- Full markdown rendering for rich responses

### CLI Usage

```bash
# Get a Chuck Norris joke
npm run dev -- -p "Tell me a Chuck Norris joke about history"

# Check GitHub issues
npm run dev -- -p "Show me my GitHub issues"

# Get weather information
npm run dev -- -p "What's the weather in Tokyo?"

# Enable debug logging
npm run dev -- -p "Tell me a joke about science" --debug
```

#### Command Line Options

- `-p, --prompt <prompt>`: **Required**. Your request in natural language
- `-d, --debug`: Enable debug logging
- `-h, --help`: Show help message

### How It Works

1. You provide a single prompt describing what you want
2. The agent automatically searches the MCP registry for appropriate servers
3. It selects the best matching server
4. It executes your request using that server
5. You get the result - simple!

## Architecture

The application is split into two main components:

- **`src/agent.ts`** - CLI application (~140 lines)
- **`src/server.ts`** - Express server for the Web UI (~140 lines)
- **`public/index.html`** - Dark-themed web interface with Kong branding

### Code Structure

**CLI (agent.ts):**
1. **Configuration**: Model, registry URL, debug flag
2. **CLI Parsing**: Get user prompt from command line
3. **Find Server**: Search registry for appropriate MCP server
4. **Execute Request**: Run user request on found server
5. **Main Flow**: Orchestrate the entire process

**Web UI (server.ts + index.html):**
1. **Express Server**: API endpoint to run the agent
2. **Static Files**: Dark-themed HTML/CSS/JS interface
3. **Markdown Rendering**: Using marked.js library
4. **Configuration Management**: Browser local storage

## Registering MCP Servers

Before using the agent, you'll need to register MCP servers with the registry. Here's how to register the OpenWeatherMap weather MCP using the Kong platform API:

1. First, query and export the registry ID as an environment variable:

```bash
export REGISTRY_ID=$(curl -s "https://localhost:8443/api/registry/v0/registries" \
  -H "Content-Type: application/json" \
  --insecure | jq -r '.data[] | select(.name == "dev-mcp-registry") | .id')
```

2. Then register the weather MCP server:

```bash
curl -X POST "http://localhost:8000/api/registry/v0/registries/$REGISTRY_ID/v0.1/publish" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Weather MCP",
    "name": "org.openweathermap.api/weather",
    "description": "Get the weather for a city",
    "version": "2.5",
    "remotes": [
      {
        "type": "streamable-http",
        "url": "http://localhost:8000/weather-mcp"
      }
    ]
  }'
```

This registers the weather MCP server so the agent can automatically discover and use it when you ask weather-related questions.

## Cleanup

To remove the registered MCP server from the registry:

```bash
curl -X DELETE "https://localhost:8443/api/registry/v0/registries/$REGISTRY_ID/v0.1/servers/org.openweathermap.api%2Fweather/versions/2.5" \
  -H "Content-Type: application/json" \
  --insecure
```

This will delete the weather MCP server and its version from the registry.

## Configuration

### Environment Variables (CLI only)

- `OPENAI_API_KEY` (required): Your OpenAI API key

### Web UI Configuration

All configuration is done through the web interface:

- **OpenAI API Key** (required): Your OpenAI API key
- **Registry URL** (required): The MCP registry endpoint (e.g., `http://localhost:8000/mcp/registry`)
- **OpenAI Base URL** (optional): Custom base URL for OpenAI API (defaults to OpenAI's official endpoint). Useful for using proxies or alternative OpenAI-compatible APIs.
- **OpenAI Model** (optional): The model to use (defaults to `gpt-4o-mini`). Other options include `gpt-4`, `gpt-4o`, etc.

## Available Scripts

- `npm run dev` - Run the TypeScript source directly using tsx (CLI mode)
- `npm run ui` - Start the web UI server in development mode
- `npm run ui:build` - Build and run the compiled web UI server
- `npm run build` - Compile TypeScript to JavaScript in the `dist/` folder
- `npm start` - Run the compiled JavaScript from `dist/agent.js`
- `npm run clean` - Remove the `dist/` folder

## Technical Details

- **ES Modules**: Top-level await with IIFE pattern
- **TypeScript**: ES2022 target, minimal type annotations
- **JSON Schema**: Structured outputs for server discovery
- **Functional Style**: Arrow functions, no classes
- **Express.js**: Web server for the UI
- **Marked.js**: Markdown rendering for responses
- **Kong Branding**: Dark theme with lime green (#CAFE00) accents

## Browser Compatibility

The Web UI works in all modern browsers that support:
- ES6+ JavaScript
- CSS Grid and Flexbox
- Local Storage API

## License

Apache-2.0
