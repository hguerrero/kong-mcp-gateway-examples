import { agent, LLMHandle, llmOpenAI, llmOpenAIResponses, mcp } from "volcano-sdk";

// Types
interface MCPServer {
  url: string;
  name: string;
  description: string;
}

// Configuration
const CONFIG = {
  MODEL: "gpt-4o-mini",
  REGISTRY_URL: "http://localhost:8000/mcp/registry",
} as const;

// Simple logging
const log = {
  info: (msg: string, emoji = 'ℹ️') => console.log(`${emoji} ${msg}`),
  success: (msg: string, emoji = '✅') => console.log(`${emoji} ${msg}`),
  error: (msg: string, emoji = '❌') => console.error(`${emoji} ${msg}`),
  debug: (msg: string, data?: any, emoji = '🔍') => {
    if (process.env.DEBUG === 'true') {
      console.log(`${emoji} ${msg}`);
      if (data) console.log(JSON.stringify(data, null, 2));
    }
  }
};

// Parse CLI args
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    prompt: '',
    debug: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--prompt' || arg === '-p') {
      options.prompt = args[++i] || '';
    } else if (arg === '--debug' || arg === '-d') {
      options.debug = true;
      process.env.DEBUG = 'true';
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: npm run dev [options]

Options:
  -p, --prompt <prompt>    Free-form prompt for your request
                           The agent will search for appropriate MCP servers
                           and execute your request
                           Example: "Tell me a Chuck Norris joke about programming"

  -d, --debug              Enable debug logging
  -h, --help               Show this help message

Examples:
  # Get a Chuck Norris joke
  npm run dev -- -p "Tell me a Chuck Norris joke about history"

  # Check GitHub issues
  npm run dev -- -p "Show me my GitHub issues"

  # Get weather information
  npm run dev -- -p "What's the weather in Tokyo?"

  # With debug logging
  npm run dev -- -p "Tell me a joke about science" --debug
`);
      process.exit(0);
    }
  }

  // Validate required arguments
  if (!options.prompt) {
    log.error('Prompt is required. Use -p or --prompt to provide your request.');
    log.info('Run with --help for usage information.');
    process.exit(1);
  }

  return options;
}

// Search for MCP servers
async function searchMCPServers(structuredLlm: LLMHandle, query: string): Promise<MCPServer[]> {
  log.info(`Searching for MCP servers: ${query}`, '🔍');

  try {
    const registryMcp = mcp(CONFIG.REGISTRY_URL);
    const results = await agent({ llm: structuredLlm })
      .then({ prompt: "search for MCP servers to address this request using only one word no spaces: " + query, mcps: [registryMcp] })
      .run();

    if (results[0]?.toolCalls) {
      log.debug('Tool calls from first result', results[0].toolCalls, '🔧');
    }

    const lastResult = results[results.length - 1];
    if (!lastResult?.llmOutput) throw new Error('No LLM output received');

    const response = JSON.parse(lastResult.llmOutput || '{"data":[]}');
    return response.data || [];
  } catch (error) {
    log.error(`Error searching MCP servers: ${error}`);
    return [];
  }
}

// Execute action with MCP server
async function executeAction(llm: LLMHandle, serverUrl: string, actionPrompt: string): Promise<string> {
  log.info(`Executing action: ${actionPrompt}`, '🎯');

  try {
    const mcpServer = mcp(serverUrl);
    const results = await agent({ llm })
      .then({ prompt: actionPrompt, mcps: [mcpServer] })
      .run();

    return results[results.length - 1]?.llmOutput || 'No response received';
  } catch (error) {
    log.error(`Error executing action: ${error}`);
    return 'Failed to execute action';
  }
}

// Main function
async function main() {
  try {
    const options = parseArgs();
    log.info('Starting Volcano Agent', '🌋');
    log.debug('CLI options', options);

    // Validate API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      log.error('OPENAI_API_KEY environment variable is required');
      process.exit(1);
    }

    // Create LLM instances
    const llm = llmOpenAI({ apiKey, model: CONFIG.MODEL });
    const structuredLlm = llmOpenAIResponses({
      apiKey,
      model: CONFIG.MODEL,
      options: {
        jsonSchema: {
          name: "mcp_response",
          description: "MCP Server information",
          schema: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    url: { type: "string" },
                    name: { type: "string" },
                    description: { type: "string" },
                  },
                  required: ["url", "name", "description"],
                  additionalProperties: false,
                },
              },
            },
            required: ["data"],
            additionalProperties: false,
          },
        },
      }
    });

    // Search for MCP servers using the provided prompt
    const mcpServers = await searchMCPServers(structuredLlm, options.prompt);

    log.info(`Found ${mcpServers.length} MCP servers`, '📋');
    log.debug('MCP servers details', mcpServers);

    if (mcpServers.length === 0) {
      log.error('No MCP servers found matching your request');
      process.exit(1);
    }

    const selectedServer = mcpServers[0];
    log.success(`Using MCP server: ${selectedServer.name} (${selectedServer.url})`);
    log.info(`Description: ${selectedServer.description}`);

    // Execute the user's request with the found server
    const result = await executeAction(llm, selectedServer.url, options.prompt);
    log.info('\nResult:', '✨');
    console.log(result);

    log.success('Application completed successfully', '🎉');

  } catch (error) {
    log.error(`Fatal error: ${error}`, '💥');
    process.exit(1);
  }
}

// Run the application
main().catch(error => {
  log.error(`Unhandled error: ${error}`, '🚨');
  process.exit(1);
});