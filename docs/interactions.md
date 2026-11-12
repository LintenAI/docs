import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /interactions

| Feature | Supported | Notes |
|---------|-----------|-------|
| Logging | ✅ | Works across all integrations |
| Streaming | ✅ | |
| Loadbalancing | ✅ | Between supported models |
| Supported LLM providers | **All Linten supported CHAT COMPLETION providers** | `openai`, `anthropic`, `bedrock`, `vertex_ai`, `gemini`, `azure`, `azure_ai` etc. |

## **Linten Python SDK Usage**

### Quick Start

```python showLineNumbers title="Create Interaction"
import linten
import os

os.environ["GEMINI_API_KEY"] = "your-api-key"

response = linten.interactions.create(
    model="gemini/{{gemini_flash}}",
    input="Tell me a short joke about programming."
)

print(response.outputs[-1].text)
```

### Async Usage

```python showLineNumbers title="Async Create Interaction"
import linten
import os
import asyncio

os.environ["GEMINI_API_KEY"] = "your-api-key"

async def main():
    response = await linten.interactions.acreate(
        model="gemini/{{gemini_flash}}",
        input="Tell me a short joke about programming."
    )
    print(response.outputs[-1].text)

asyncio.run(main())
```

### Streaming

```python showLineNumbers title="Streaming Interaction"
import linten
import os

os.environ["GEMINI_API_KEY"] = "your-api-key"

response = linten.interactions.create(
    model="gemini/{{gemini_flash}}",
    input="Write a 3 paragraph story about a robot.",
    stream=True
)

for chunk in response:
    print(chunk)
```

## **Linten AI Gateway (Proxy) Usage**

### Setup

Add this to your linten proxy config.yaml:

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gemini-flash
    linten_params:
      model: gemini/{{gemini_flash}}
      api_key: os.environ/GEMINI_API_KEY
```

Start linten:

```bash
linten --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

### Test Request

<Tabs>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="Create Interaction"
curl -X POST "http://localhost:4000/v1beta/interactions" \
  -H "Authorization: Bearer $LINTEN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini/{{gemini_flash}}",
    "input": "Tell me a short joke about programming."
  }'
```

**Streaming:**

```bash showLineNumbers title="Streaming Interaction"
curl -N -X POST "http://localhost:4000/v1beta/interactions" \
  -H "Authorization: Bearer $LINTEN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini/{{gemini_flash}}",
    "input": "Write a 3 paragraph story about a robot.",
    "stream": true
  }'
```

**Get Interaction:**

```bash showLineNumbers title="Get Interaction by ID"
curl "http://localhost:4000/v1beta/interactions/{interaction_id}" \
  -H "Authorization: Bearer $LINTEN_API_KEY"
```

</TabItem>

<TabItem value="google-sdk" label="Google GenAI SDK">

Point the Google GenAI SDK to Linten Proxy:

```python showLineNumbers title="Google GenAI SDK with Linten Proxy"
from google import genai

# Point SDK to Linten Proxy
client = genai.Client(
    api_key="sk-<your-linten-api-key>",  # Your Linten API key
    http_options={"base_url": "http://localhost:4000"},
)

# Create an interaction
interaction = client.interactions.create(
    model="gemini/{{gemini_flash}}",
    input="Tell me a short joke about programming."
)

print(interaction.outputs[-1].text)
```

**Streaming:**

```python showLineNumbers title="Google GenAI SDK Streaming"
from google import genai

client = genai.Client(
    api_key="sk-<your-linten-api-key>",  # Your Linten API key
    http_options={"base_url": "http://localhost:4000"},
)

for chunk in client.interactions.create_stream(
    model="gemini/{{gemini_flash}}",
    input="Write a story about space exploration.",
):
    print(chunk)
```

</TabItem>
</Tabs>

## **Request/Response Format**

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | Model to use (e.g., `gemini/gemini-2.5-flash`) |
| `input` | string | Yes | The input text for the interaction |
| `stream` | boolean | No | Enable streaming responses |
| `tools` | array | No | Tools available to the model |
| `system_instruction` | string | No | System instructions for the model |
| `generation_config` | object | No | Generation configuration |
| `previous_interaction_id` | string | No | ID of previous interaction for context |
| `continuation_token` | string | No | Token from an interaction that ended with `status: "requires_continuation"`, to resume that long decode yourself |

### Response Format

```json
{
  "id": "interaction_abc123",
  "object": "interaction",
  "model": "{{gemini_flash}}",
  "status": "completed",
  "created": "2025-01-15T10:30:00Z",
  "updated": "2025-01-15T10:30:05Z",
  "role": "model",
  "outputs": [
    {
      "type": "text",
      "text": "Why do programmers prefer dark mode? Because light attracts bugs!"
    }
  ],
  "usage": {
    "total_input_tokens": 10,
    "total_output_tokens": 15,
    "total_tokens": 25
  }
}
```

## **Long decode (answers past Google's per-request output cap)**

A foreground Interactions request to a model that supports long decode (for example `gemini/gemini-4-argon`) stops at Google's per-request cap, 32,768 output tokens when not streaming and 65,536 when streaming, with `status: "requires_continuation"` and a `continuation_token`. Linten passes both through unchanged, exactly as Google returns them, and does not continue the decode for you. To get the rest of the answer, send the request again with `previous_interaction_id` set to that interaction's `id` and `continuation_token` set to that token, and repeat until the status is no longer `requires_continuation`. Each hop is its own request, with its own spend log, budget check and rate limit.

```python
import linten

request = {
    "model": "gemini/gemini-4-argon",
    "generation_config": {"max_output_tokens": 262144, "thinking_level": "high"},
}
response = linten.interactions.create(input="Write a complete, rigorous proof of the prime number theorem.", **request)
steps = list(response.steps or [])
while response.status == "requires_continuation":
    response = linten.interactions.create(
        previous_interaction_id=response.id,
        continuation_token=response.continuation_token,
        **request,
    )
    steps.extend(response.steps or [])
print(response.status)  # "completed"
print("".join(c["text"] for step in steps for c in step.get("content", []) if c.get("type") == "text"))
```

Every hop re-reads the answer so far as input, so each hop's `usage.total_input_tokens` grows while `usage.initial_input_tokens` stays the size of your prompt. With `store: false` nothing is stored on Google's side, so resend `input` instead of `previous_interaction_id`. In streaming mode the `interaction.completed` event carries the same `status` and `continuation_token`.

Background requests (`background: true`) are continued by Google on its side and need no client hops.

## **Calling non-Interactions API endpoints (`/interactions` to `/responses` Bridge)**

Linten allows you to call non-Interactions API models via a bridge to Linten's `/responses` endpoint. This is useful for calling OpenAI, Anthropic, and other providers that don't natively support the Interactions API.

#### Python SDK Usage

```python showLineNumbers title="SDK Usage"
import linten
import os

# Set API key
os.environ["OPENAI_API_KEY"] = "your-openai-api-key"

# Non-streaming interaction
response = linten.interactions.create(
    model="{{openai_large}}",
    input="Tell me a short joke about programming."
)

print(response.outputs[-1].text)
```

#### Linten Proxy Usage

**Setup Config:**

```yaml showLineNumbers title="Example Configuration"
model_list:
- model_name: openai-model
  linten_params:
    model: {{openai_large}}
    api_key: os.environ/OPENAI_API_KEY
```

**Start Proxy:**

```bash showLineNumbers title="Start Linten Proxy"
linten --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

**Make Request:**

```bash showLineNumbers title="non-Interactions API Model Request"
curl http://localhost:4000/v1beta/interactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LINTEN_API_KEY" \
  -d '{
    "model": "openai-model",
    "input": "Tell me a short joke about programming."
  }'
```

## **Supported Providers**

| Provider | Link to Usage |
|----------|---------------|
| Google AI Studio | [Usage](#quick-start) |
| All other Linten providers | [Bridge Usage](#calling-non-interactions-api-endpoints-interactions-to-responses-bridge) |
