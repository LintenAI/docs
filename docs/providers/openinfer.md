import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# OpenInfer

<SinceVersion v="1.107.0" />

## Overview

| Property | Details |
|-------|-------|
| Description | OpenInfer Cloud is a hosted, OpenAI-compatible inference API. |
| Provider Route on Linten | `openinfer/` |
| Link to Provider Doc | [OpenInfer ↗](https://openinfer.ai/) |
| Base URL | `https://api.openinfer.ai/v1` |
| Supported Operations | [`/chat/completions`](#usage---linten-python-sdk), [`/responses`](#responses-api), [`/messages`](#anthropic-messages-api) |

<br />
<br />

https://openinfer.ai/

**We support ALL OpenInfer chat models, just set `openinfer/` as a prefix when sending completion requests**

OpenInfer chat model IDs use an `@oi/` prefix. Linten catalog keys are `openinfer/@oi/...`, so the `@oi/` prefix is forwarded to the API.

## Available Models

| Model | Context window |
|-------|----------------|
| `openinfer/@oi/GLM-5.3-Flash` | 393,216 |
| `openinfer/@oi/Qwen3.5-27B` | 32,768 |
| `openinfer/@oi/Qwen3.5-9B` | 100,000 |

These are the models OpenInfer publishes a price for, so Linten tracks their spend. OpenInfer bounds a request only by the context window, so prompt plus output tokens must fit in it.

Any other OpenInfer chat model also works with the `openinfer/` prefix, but Linten records its spend as $0 until a price is added. Linten sends tool calls to every OpenInfer model, and OpenInfer answers with a 400 for a model it serves without tool support, such as `@oi/Gemma-4-31B-It`.

## Required Variables

```python showLineNumbers title="Environment Variables"
os.environ["OPENINFER_API_KEY"] = ""  # your OpenInfer API key
```

Get an API key from the [OpenInfer console](https://console.openinfer.ai/register).

You can overwrite the base url with:

```
os.environ["OPENINFER_API_BASE"] = "https://api.openinfer.ai/v1"
```

## Usage - Linten Python SDK

### Non-streaming

```python showLineNumbers title="OpenInfer Non-streaming Completion"
import os
import linten
from linten import completion

os.environ["OPENINFER_API_KEY"] = ""  # your OpenInfer API key

messages = [{"content": "Hello, how are you?", "role": "user"}]

# OpenInfer call
response = completion(
    model="openinfer/@oi/Qwen3.5-27B",
    messages=messages
)

print(response)
```

### Streaming

```python showLineNumbers title="OpenInfer Streaming Completion"
import os
import linten
from linten import completion

os.environ["OPENINFER_API_KEY"] = ""  # your OpenInfer API key

messages = [{"content": "Hello, how are you?", "role": "user"}]

# OpenInfer call with streaming
response = completion(
    model="openinfer/@oi/Qwen3.5-27B",
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

### Responses API

Linten sends `/responses` calls to OpenInfer's own `/v1/responses` endpoint.

```python showLineNumbers title="OpenInfer Responses API"
import os
import linten

os.environ["OPENINFER_API_KEY"] = ""  # your OpenInfer API key

response = linten.responses(
    model="openinfer/@oi/Qwen3.5-27B",
    input="Name three primary colors"
)

print(response.output[0].content[0].text)
```

### Anthropic Messages API

Linten sends `/messages` calls to OpenInfer's own `/v1/messages` endpoint.

```python showLineNumbers title="OpenInfer Messages API"
import asyncio
import os
import linten

os.environ["OPENINFER_API_KEY"] = ""  # your OpenInfer API key

async def main():
    response = await linten.anthropic.messages.acreate(
        model="openinfer/@oi/Qwen3.5-27B",
        messages=[{"role": "user", "content": "Name three primary colors"}],
        max_tokens=200
    )
    print(response["content"])

asyncio.run(main())
```

## Usage - Linten Proxy

Add the following to your Linten Proxy configuration file:

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: oi-qwen
    linten_params:
      model: openinfer/@oi/Qwen3.5-27B
      api_key: os.environ/OPENINFER_API_KEY

  - model_name: oi-glm
    linten_params:
      model: openinfer/@oi/GLM-5.3-Flash
      api_key: os.environ/OPENINFER_API_KEY
      api_base: os.environ/OPENINFER_API_BASE  # optional
```

Start your Linten Proxy server:

```bash showLineNumbers title="Start Linten Proxy"
export LINTEN_MASTER_KEY="sk-$(openssl rand -hex 32)"
printf 'Local proxy key: %s\n' "$LINTEN_MASTER_KEY"
linten --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

In another terminal, set `LINTEN_API_KEY` to the key printed above, then call the proxy:

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="OpenInfer via Proxy - Non-streaming"
import os
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",       # Your proxy URL
    api_key=os.environ["LINTEN_API_KEY"]   # The proxy key printed at startup
)

# Non-streaming response
response = client.chat.completions.create(
    model="oi-qwen",
    messages=[{"role": "user", "content": "hello from linten"}]
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="OpenInfer via Proxy - Streaming"
import os
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",       # Your proxy URL
    api_key=os.environ["LINTEN_API_KEY"]   # The proxy key printed at startup
)

# Streaming response
response = client.chat.completions.create(
    model="oi-glm",
    messages=[{"role": "user", "content": "hello from linten"}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

</TabItem>
<TabItem value="linten-sdk" label="Linten SDK">

```python showLineNumbers title="OpenInfer via Proxy - Linten SDK"
import os
import linten

# Configure Linten to use your proxy
response = linten.completion(
    model="linten_proxy/oi-qwen",
    messages=[{"role": "user", "content": "hello from linten"}],
    api_base="http://localhost:4000",
    api_key=os.environ["LINTEN_API_KEY"]
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="OpenInfer via Proxy - Linten SDK Streaming"
import os
import linten

# Configure Linten to use your proxy with streaming
response = linten.completion(
    model="linten_proxy/oi-glm",
    messages=[{"role": "user", "content": "hello from linten"}],
    api_base="http://localhost:4000",
    api_key=os.environ["LINTEN_API_KEY"],
    stream=True
)

for chunk in response:
    if hasattr(chunk.choices[0], 'delta') and chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

</TabItem>
<TabItem value="curl" label="cURL">

```bash showLineNumbers title="OpenInfer via Proxy - cURL"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LINTEN_API_KEY" \
  -d '{
    "model": "oi-qwen",
    "messages": [{"role": "user", "content": "hello from linten"}]
  }'
```

```bash showLineNumbers title="OpenInfer via Proxy - cURL Streaming"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LINTEN_API_KEY" \
  -d '{
    "model": "oi-glm",
    "messages": [{"role": "user", "content": "hello from linten"}],
    "stream": true
  }'
```

```bash showLineNumbers title="OpenInfer via Proxy - cURL Responses API"
curl http://localhost:4000/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LINTEN_API_KEY" \
  -d '{
    "model": "oi-qwen",
    "input": "hello from linten"
  }'
```

```bash showLineNumbers title="OpenInfer via Proxy - cURL Messages API"
curl http://localhost:4000/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LINTEN_API_KEY" \
  -d '{
    "model": "oi-qwen",
    "max_tokens": 200,
    "messages": [{"role": "user", "content": "hello from linten"}]
  }'
```

</TabItem>
</Tabs>

For more detailed information on using the Linten Proxy, see the [Linten Proxy documentation](../providers/linten_proxy).
