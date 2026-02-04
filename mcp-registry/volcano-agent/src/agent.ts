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
  PROMPTS: {
    CHUCK_NORRIS: "Search for a MCP server that handles chuck norris jokes. Include url, name, and description for each server.",
    GITHUB_ISSUES: "Return all MCP servers that allow me to check my github issues. Include url, name, and description for each server.",
  }
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
  const options = { searchType: 'chuck-norris', topic: 'history', debug: false };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--search-type' || arg === '-s') options.searchType = args[++i] || 'chuck-norris';
    else if (arg === '--topic' || arg === '-t') options.topic = args[++i] || 'history';
    else if (arg === '--debug' || arg === '-d') { options.debug = true; process.env.DEBUG = 'true'; }
    else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: npm run dev [options]
  -s, --search-type <type>    'chuck-norris' or 'github-issues' (default: chuck-norris)
  -t, --topic <topic>         Topic for jokes (default: history)
  -d, --debug                 Enable debug logging
  -h, --help                  Show help
`);
      process.exit(0);
    }
  }
  return options;
}

// Search for MCP servers
async function searchMCPServers(structuredLlm: LLMHandle, query: string): Promise<MCPServer[]> {
  log.info(`Searching for MCP servers: ${query}`, '🔍');

  try {
    const registryMcp = mcp(CONFIG.REGISTRY_URL);
    const results = await agent({ llm: structuredLlm })
      .then({ prompt: query, mcps: [registryMcp] })
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

// Get a joke from Chuck Norris MCP server
async function getJoke(llm: LLMHandle, serverUrl: string, topic: string): Promise<string> {
  log.info(`Getting Chuck Norris joke about: ${topic}`, '😄');

  try {
    const mcpServer = mcp(serverUrl);
    const results = await agent({ llm })
      .then({ prompt: `Tell me a Chuck Norris joke about ${topic}`, mcps: [mcpServer] })
      .run();

    return results[results.length - 1]?.llmOutput || 'No joke received';
  } catch (error) {
    log.error(`Error getting joke: ${error}`);
    return 'Failed to get joke';
  }
}

// Main function
async function main() {
  try {
    const options = parseArgs();
    log.info(`Starting Volcano Agent for ${options.searchType}`, '🌋');
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

    // Search for MCP servers
    const searchQuery = options.searchType === 'chuck-norris' ? CONFIG.PROMPTS.CHUCK_NORRIS : CONFIG.PROMPTS.GITHUB_ISSUES;
    const mcpServers = await searchMCPServers(structuredLlm, searchQuery);

    log.info(`Found ${mcpServers.length} MCP servers`, '📋');
    log.debug('MCP servers details', mcpServers);

    if (mcpServers.length === 0) {
      log.error(`No MCP servers found for ${options.searchType}`);
      process.exit(1);
    }

    const selectedServer = mcpServers[0];
    log.success(`Using MCP server: ${selectedServer.name} (${selectedServer.url})`);

    if (options.searchType === 'chuck-norris') {
      const joke = await getJoke(llm, selectedServer.url, options.topic);
      log.info('\nChuck Norris Joke:', '🎭');
      console.log(joke);
    } else {
      log.info('GitHub issues MCP server found');
      log.info(`Server URL: ${selectedServer.url}`);
      log.info(`Description: ${selectedServer.description}`);
    }

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