# Volcano Agent

A simple Node.js application using the Volcano SDK that automatically finds the right MCP server for your request and executes it. Just provide a single natural language prompt and the agent handles the rest.

## Features

- 🔍 **Automatic MCP Server Discovery**: Automatically searches for appropriate MCP servers based on your request
- 💬 **Single Prompt Interface**: Just tell it what you want - no need to specify search and action separately
- 🎯 **Smart Execution**: Finds the right server and executes your request automatically
- 🛠️ **Simple CLI**: One prompt, that's all you need
- 🔧 **Debug Mode**: Optional detailed logging
- 📦 **Simple Architecture**: Everything in one file for easy understanding

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set your OpenAI API key:
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   ```

## Usage

### Basic Usage
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

### Command Line Options

- `-p, --prompt <prompt>`: **Required**. Your request in natural language
- `-d, --debug`: Enable debug logging
- `-h, --help`: Show help message

### Examples

```bash
# Chuck Norris jokes
npm run dev -- -p "Tell me a Chuck Norris joke about history"
npm run dev -- -p "Give me a funny Chuck Norris joke about science"

# GitHub integration
npm run dev -- -p "Show me my open GitHub issues"
npm run dev -- -p "List my GitHub repositories"

# Weather services
npm run dev -- -p "What's the weather forecast for New York?"
npm run dev -- -p "Tell me the current temperature in London"

# With debug logging
npm run dev -- -p "Tell me a joke" --debug

# Help
npm run dev -- --help
```

### How It Works

1. You provide a single prompt describing what you want
2. The agent automatically searches the MCP registry for appropriate servers
3. It selects the best matching server
4. It executes your request using that server
5. You get the result - simple!

### Production

```bash
# Build the TypeScript code
npm run build

# Run the compiled JavaScript
npm start
```

## Architecture

Minimal single-file application (~140 lines):

- **`src/agent.ts`** - Complete application in one file

### Code Structure

1. **Configuration** (lines 3-6): Model, registry URL, debug flag
2. **CLI Parsing** (lines 14-40): Get user prompt from command line
3. **Find Server** (lines 42-60): Search registry for appropriate MCP server
4. **Execute Request** (lines 62-72): Run user request on found server
5. **Main Flow** (lines 74-139): Orchestrate the entire process

### Key Features

1. **Minimal Code**: ~140 lines of clean, focused code
2. **No Classes**: Simple functions and arrow functions
3. **Structured Responses**: JSON Schema for reliable server discovery
4. **Error Handling**: Simple try-catch with clear error messages
5. **Debug Mode**: Optional detailed logging via `--debug` flag

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

The application supports the following environment variables:

- `OPENAI_API_KEY` (required): Your OpenAI API key

You can also enable debug mode using the `--debug` CLI flag.

## Available Scripts

- `npm run dev` - Run the TypeScript source directly using tsx
- `npm run build` - Compile TypeScript to JavaScript in the `dist/` folder
- `npm start` - Run the compiled JavaScript from `dist/agent.js`
- `npm run clean` - Remove the `dist/` folder

## Technical Details

- **ES Modules**: Top-level await with IIFE pattern
- **TypeScript**: ES2022 target, minimal type annotations
- **JSON Schema**: Structured outputs for server discovery
- **Functional Style**: Arrow functions, no classes
- **~140 Lines**: Entire application in one focused file
