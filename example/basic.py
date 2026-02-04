from openai import OpenAI
import httpx
import os

# Read API key from environment variable
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY environment variable is required")

# Configure the client for Kong AI Gateway with SSL verification disabled
client = OpenAI(
    api_key=api_key,
    # base_url="https://ai-gateway.kong-sales-engineering.com",
    default_headers={
        "x-provider": "bedrock",
        "x-model": "anthropic.claude-3-haiku-20240307-v1:0"
    },
    http_client=httpx.Client(verify=False)
)

# Make your first chat completion request
completion = client.chat.completions.create(
    messages=[
        {"role": "user", "content": "Hello! How are you today?"}
    ],
    model="gpt-4o-mini"
    # model="anthropic.claude-3-haiku-20240307-v1:0"
)

# Print the response
print(completion.choices[0].message.content)
