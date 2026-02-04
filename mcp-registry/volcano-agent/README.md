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

Simple single-file application with everything included:

- **`src/agent.ts`** - Complete application in one file

### Key Features

1. **Type Safety**: TypeScript interfaces for MCP servers
2. **Error Handling**: Try-catch blocks with graceful failures
3. **Environment Validation**: Checks for required API key
4. **Structured Responses**: JSON Schema for reliable API responses
5. **Simple Design**: All functionality in one readable file

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

- **ES Modules**: Configured as ES module with top-level await support
- **TypeScript**: ES2022 target with proper module resolution
- **JSON Schema**: Structured outputs with validation
- **Error Recovery**: Graceful handling of API failures
