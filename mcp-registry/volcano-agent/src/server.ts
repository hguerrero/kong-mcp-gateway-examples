import * as expressModule from 'express';
import { Request, Response } from 'express';
import { agent, llmOpenAI, llmOpenAIResponses, mcp } from "volcano-sdk";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const express = (expressModule as any).default || expressModule;
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Default Configuration
const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_BASE_URL = undefined;

// Search for MCP servers in registry
const findMCPServer = async (llm: any, registryUrl: string, userPrompt: string, debug: boolean) => {
  const registryMcp = mcp(registryUrl);
  const results = await agent({ llm })
    .then({
      prompt: `search for MCP servers to address this request using only one word no spaces: ${userPrompt}`,
      mcps: [registryMcp]
    })
    .run();

  if (debug && results[0]?.toolCalls) {
    console.log('Tool calls:', JSON.stringify(results[0].toolCalls, null, 2));
  }

  const response = JSON.parse(results[results.length - 1]?.llmOutput || '{"data":[]}');
  return response.data?.[0];
};

// Execute user request with MCP server
const executeRequest = async (llm: any, serverUrl: string, userPrompt: string) => {
  const mcpServer = mcp(serverUrl);
  const results = await agent({ llm })
    .then({ prompt: userPrompt, mcps: [mcpServer] })
    .run();

  return results[results.length - 1]?.llmOutput || 'No response';
};

// API endpoint to run the agent
app.post('/api/run', async (req: Request, res: Response) => {
  const { prompt, apiKey, registryUrl, openaiBaseUrl, openaiModel, debug = false } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!apiKey) {
    return res.status(400).json({ error: 'OpenAI API Key is required' });
  }

  if (!registryUrl) {
    return res.status(400).json({ error: 'Registry URL is required' });
  }

  const model = openaiModel || DEFAULT_MODEL;
  const baseUrl = openaiBaseUrl || DEFAULT_BASE_URL;

  try {
    console.log('🌋 Starting Volcano Agent');
    console.log(`🤖 Using model: ${model}`);
    if (baseUrl) console.log(`🔗 Using base URL: ${baseUrl}`);
    if (debug) console.log('Prompt:', prompt);

    // Create LLM config
    const llmConfig: any = {
      apiKey,
      model,
    };
    if (baseUrl) {
      llmConfig.baseURL = baseUrl;
    }

    // Create LLM for structured responses (finding servers)
    const structuredLlm = llmOpenAIResponses({
      ...llmConfig,
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
    console.log('🔍 Searching for MCP servers...');
    const server = await findMCPServer(structuredLlm, registryUrl, prompt, debug);

    if (!server) {
      return res.status(404).json({ error: 'No MCP server found for your request' });
    }

    console.log(`✅ Using: ${server.name} (${server.url})`);
    if (debug) console.log('Server:', JSON.stringify(server, null, 2));

    // Execute request
    console.log('🎯 Executing request...');
    const llm = llmOpenAI(llmConfig);
    const result = await executeRequest(llm, server.url, prompt);

    console.log('✨ Request completed');

    res.json({
      success: true,
      server: {
        name: server.name,
        url: server.url,
        description: server.description
      },
      result
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      error: 'Error executing request',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Volcano Agent UI running at http://localhost:${PORT}`);
});
