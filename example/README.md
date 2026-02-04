# Kong AI Gateway Example

This example demonstrates how to use the OpenAI Python client with Kong AI Gateway.

## Setup

1. Install the required dependencies:
```bash
pip install openai httpx
```

2. Set your API key as an environment variable:
```bash
export OPENAI_API_KEY="your-api-key-here"
```

3. Run the example:
```bash
python basic.py
```

## Configuration

The script is configured to:
- Connect to Kong AI Gateway at `https://ai-gateway.kong-sales-engineering.com`
- Use Bedrock provider with Claude 3 Haiku model
- Disable SSL verification (for development/testing)
- Read API key from `OPENAI_API_KEY` environment variable

## Environment Variables

- `OPENAI_API_KEY`: Required. Your API key for authentication with Kong AI Gateway.

## Troubleshooting

- **SSL Certificate Error**: The script disables SSL verification with `verify=False`
- **401 Unauthorized**: Check that your `OPENAI_API_KEY` is set correctly
- **Missing API Key**: The script will raise a `ValueError` if `OPENAI_API_KEY` is not set
