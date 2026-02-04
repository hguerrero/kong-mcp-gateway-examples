# Volcano Agent

A simple Node.js application using the Volcano SDK to search for MCP servers and interact with them. Get Chuck Norris jokes or find GitHub issues servers with a clean, single-file implementation.

## Features

- 🔍 **MCP Server Discovery**: Search for MCP servers in a registry
- 🎭 **Chuck Norris Jokes**: Get jokes from Chuck Norris MCP servers
- 🐙 **GitHub Integration**: Find MCP servers for GitHub issues
- 🛠️ **CLI Interface**: Simple command-line options
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
# Get a Chuck Norris joke about history (default)
npm run dev

# Get a Chuck Norris joke about programming
npm run dev -- --topic programming

# Search for GitHub issues MCP servers
npm run dev -- --search-type github-issues

# Enable debug logging
npm run dev -- --debug
```

### Command Line Options

- `-s, --search-type <type>`: Search type: 'chuck-norris' or 'github-issues' (default: chuck-norris)
- `-t, --topic <topic>`: Topic for Chuck Norris jokes (default: history)
- `-d, --debug`: Enable debug logging
- `-h, --help`: Show help message

### Examples

```bash
# Different joke topics
npm run dev -- -t "space exploration"
npm run dev -- -t "artificial intelligence"

# GitHub issues search with debug
npm run dev -- -s github-issues --debug

# Help
npm run dev -- --help
```

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
- `DEBUG` (optional): Set to 'true' to enable debug logging

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
