import { agent, llmOpenAI, llmOpenAIResponses, mcp } from "volcano-sdk";

// Configuration
const MODEL = "gpt-4o-mini";
const REGISTRY_URL = "http://localhost:8000/mcp/registry";
const DEBUG = process.argv.includes('--debug') || process.argv.includes('-d');

// Logging
const log = (msg: string, data?: any) => {
  console.log(msg);
  if (DEBUG && data) console.log(JSON.stringify(data, null, 2));
};

// Get prompt from CLI
const getPrompt = (): string => {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: npm run dev -- -p "<your request>"

Examples:
  npm run dev -- -p "Tell me a Chuck Norris joke about history"
  npm run dev -- -p "Show me my GitHub issues"
  npm run dev -- -p "What's the weather in Tokyo?"
  npm run dev -- -p "Tell me a joke" --debug
`);
    process.exit(0);
  }

  const promptIndex = args.findIndex((arg: string) => arg === '-p' || arg === '--prompt');
  const prompt = promptIndex >= 0 ? args[promptIndex + 1] : '';

  if (!prompt) {
    console.error('❌ Prompt required. Use: npm run dev -- -p "your request"');
    process.exit(1);
  }

  return prompt;
};

// Search for MCP servers in registry
const findMCPServer = async (llm: any, userPrompt: string) => {
  log('🔍 Searching for MCP servers...');

  const registryMcp = mcp(REGISTRY_URL);
  const results = await agent({ llm })
    .then({
      prompt: `search for MCP servers to address this request using only one word no spaces: ${userPrompt}`,
      mcps: [registryMcp]
    })
    .run();

  if (DEBUG && results[0]?.toolCalls) {
    log('Tool calls:', results[0].toolCalls);
  }

  const response = JSON.parse(results[results.length - 1]?.llmOutput || '{"data":[]}');
  return response.data?.[0];
};

// Execute user request with MCP server
const executeRequest = async (llm: any, serverUrl: string, userPrompt: string) => {
  log('🎯 Executing request...');

  const mcpServer = mcp(serverUrl);
  const results = await agent({ llm })
    .then({ prompt: userPrompt, mcps: [mcpServer] })
    .run();

  return results[results.length - 1]?.llmOutput || 'No response';
};

// Main
(async () => {
  try {
    const userPrompt = getPrompt();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY environment variable required');
      process.exit(1);
    }

    log('🌋 Starting Volcano Agent');
    if (DEBUG) log('Prompt:', userPrompt);

    // Create LLM for structured responses (finding servers)
    const structuredLlm = llmOpenAIResponses({
      apiKey,
      model: MODEL,
      options: {
        jsonSchema: {
          name: "mcp_servers",
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

    // Find MCP server
    const server = await findMCPServer(structuredLlm, userPrompt);

    if (!server) {
      console.error('❌ No MCP server found for your request');
      process.exit(1);
    }

    log(`✅ Using: ${server.name} (${server.url})`);
    if (DEBUG) log('Server:', server);

    // Execute request
    const llm = llmOpenAI({ apiKey, model: MODEL });
    const result = await executeRequest(llm, server.url, userPrompt);

    console.log('\n✨ Result:');
    console.log(result);

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();