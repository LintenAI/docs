import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Linten Proxy (LLM Gateway)


| Property | Details |
|-------|-------|
| Description | Linten Proxy is an OpenAI-compatible gateway that allows you to interact with multiple LLM providers through a unified API. Simply use the `linten_proxy/` prefix before the model name to route your requests through the proxy. |
| Provider Route on Linten | `linten_proxy/` (add this prefix to the model name, to route any requests to linten_proxy - e.g. `linten_proxy/your-model-name`) |
| Setup Linten Gateway | [Linten Gateway ↗](../simple_proxy) |
| Supported Endpoints |`/chat/completions`, `/completions`, `/embeddings`, `/audio/speech`, `/audio/transcriptions`, `/images`, `/images/edits`, `/rerank` |



## Required Variables

```python
os.environ["LINTEN_PROXY_API_KEY"] = "" # "sk-<your-linten-api-key>" your linten proxy api key 
os.environ["LINTEN_PROXY_API_BASE"] = "" # "http://localhost:4000" your linten proxy api base
```


## Usage (Non Streaming)
```python
import os 
import linten
from linten import completion

os.environ["LINTEN_PROXY_API_KEY"] = ""

# set custom api base to your proxy
# either set .env or linten.api_base
# os.environ["LINTEN_PROXY_API_BASE"] = ""
linten.api_base = "your-openai-proxy-url"


messages = [{ "content": "Hello, how are you?","role": "user"}]

# linten proxy call
response = completion(model="linten_proxy/your-model-name", messages=messages)
```

## Usage - passing `api_base`, `api_key` per request

If you need to set api_base dynamically, just pass it in completions instead - completions(...,api_base="your-proxy-api-base")

```python
import os 
import linten
from linten import completion

os.environ["LINTEN_PROXY_API_KEY"] = ""

messages = [{ "content": "Hello, how are you?","role": "user"}]

# linten proxy call
response = completion(
    model="linten_proxy/your-model-name", 
    messages=messages, 
    api_base = "your-linten-proxy-url",
    api_key = "your-linten-proxy-api-key"
)
```
## Usage - Streaming

```python
import os 
import linten
from linten import completion

os.environ["LINTEN_PROXY_API_KEY"] = ""

messages = [{ "content": "Hello, how are you?","role": "user"}]

# openai call
response = completion(
    model="linten_proxy/your-model-name", 
    messages=messages,
    api_base = "your-linten-proxy-url", 
    stream=True
)

for chunk in response:
    print(chunk)
```

## Embeddings

```python
import linten

response = linten.embedding(
    model="linten_proxy/your-embedding-model",
    input="Hello world",
    api_base="your-linten-proxy-url",
    api_key="your-linten-proxy-api-key"
)
```

## Image Generation

```python
import linten

response = linten.image_generation(
    model="linten_proxy/dall-e-3",
    prompt="A beautiful sunset over mountains",
    api_base="your-linten-proxy-url",
    api_key="your-linten-proxy-api-key"
)
```

## Image Edit

```python
import linten

with open("your-image.png", "rb") as f:
    response = linten.image_edit(
        model="linten_proxy/gpt-image-1",
        prompt="Make this image a watercolor painting",
        image=[f],
        api_base="your-linten-proxy-url",
        api_key="your-linten-proxy-api-key",
    )
```

## Audio Transcription

```python
import linten

response = linten.transcription(
    model="linten_proxy/whisper-1",
    file="your-audio-file",
    api_base="your-linten-proxy-url",
    api_key="your-linten-proxy-api-key"
)
```

## Text to Speech

```python
import linten

response = linten.speech(
    model="linten_proxy/tts-1",
    input="Hello world",
    api_base="your-linten-proxy-url",
    api_key="your-linten-proxy-api-key"
)
``` 

## Rerank

```python
import linten

import linten

response = linten.rerank(
    model="linten_proxy/rerank-english-v2.0",
    query="What is machine learning?",
    documents=[
        "Machine learning is a field of study in artificial intelligence",
        "Biology is the study of living organisms"
    ],
    api_base="your-linten-proxy-url",
    api_key="your-linten-proxy-api-key"
)
```


## Integration with Other Libraries

Linten Proxy works with Langchain, LlamaIndex, OpenAI JS, Anthropic SDK, Instructor, and more.

[Learn how to use Linten proxy with these libraries →](../proxy/user_keys)

## Send all SDK requests to Linten Proxy

<SinceVersion v="1.72.1" />

Use this when calling Linten Proxy from any library / codebase already using the Linten SDK.

These flags will route all requests through your Linten proxy, regardless of the model specified.

When enabled, requests will use `LINTEN_PROXY_API_BASE` with `LINTEN_PROXY_API_KEY` as the authentication.

### Option 1: Set Globally in Code

```python
# Set the flag globally for all requests
linten.use_linten_proxy = True

response = linten.completion(
    model="vertex_ai/{{gemini_flash}}",
    messages=[{"role": "user", "content": "Hello, how are you?"}]
)
```

### Option 2: Control via Environment Variable

```python
# Control proxy usage through environment variable
os.environ["USE_LINTEN_PROXY"] = "True"

response = linten.completion(
    model="vertex_ai/{{gemini_flash}}",
    messages=[{"role": "user", "content": "Hello, how are you?"}]
)
```

### Option 3: Set Per Request

```python
# Enable proxy for specific requests only
response = linten.completion(
    model="vertex_ai/{{gemini_flash}}",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
    use_linten_proxy=True
)
```

## OAuth2/JWT Authentication

If your Linten Proxy requires OAuth2/JWT authentication (e.g., Azure AD, Keycloak, Okta), the SDK can automatically obtain and refresh tokens for you.

```python
import linten
from linten.proxy_auth import AzureADCredential, ProxyAuthHandler

linten.proxy_auth = ProxyAuthHandler(
    credential=AzureADCredential(),
    scope="api://my-linten-proxy/.default"
)
linten.api_base = "https://my-proxy.example.com"

response = linten.completion(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

[Learn more about SDK Proxy Authentication (OAuth2/JWT Auto-Refresh) →](../proxy_auth)

## Sending `tags` to Linten Proxy

Tags allow you to categorize and track your API requests for monitoring, debugging, and analytics purposes. You can send tags as a list of strings to the Linten Proxy using the `extra_body` parameter.

### Usage

Send tags by including them in the `extra_body` parameter of your completion request:

```python showLineNumbers title="Usage"
import linten

response = linten.completion(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    api_base="http://localhost:4000",
    api_key="sk-<your-linten-api-key>",
    extra_body={"tags": ["user:ishaan", "department:engineering", "priority:high"]}
)
```

### Async Usage

```python showLineNumbers title="Async Usage"
import linten

response = await linten.acompletion(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    api_base="http://localhost:4000", 
    api_key="sk-<your-linten-api-key>",
    extra_body={"tags": ["user:ishaan", "department:engineering"]}
)
```

