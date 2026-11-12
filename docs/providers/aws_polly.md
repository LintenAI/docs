# AWS Polly Text to Speech (tts)

## Overview

| Property | Details |
|-------|-------|
| Description | Convert text to natural-sounding speech using AWS Polly's neural and standard TTS engines |
| Provider Route on Linten | `aws_polly/` |
| Supported Operations | `/audio/speech` |
| Link to Provider Doc | [AWS Polly SynthesizeSpeech ↗](https://docs.aws.amazon.com/polly/latest/dg/API_SynthesizeSpeech.html) |

## Quick Start

### **Linten SDK**

```python showLineNumbers title="SDK Usage"
import linten
from pathlib import Path
import os

# Set environment variables
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = "us-east-1"

# AWS Polly call
speech_file_path = Path(__file__).parent / "speech.mp3"
response = linten.speech(
    model="aws_polly/neural",
    voice="Joanna",
    input="the quick brown fox jumped over the lazy dogs",
)
response.stream_to_file(speech_file_path)
```

### **Linten PROXY**

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
  - model_name: polly-neural
    linten_params:
      model: aws_polly/neural
      aws_access_key_id: "os.environ/AWS_ACCESS_KEY_ID"
      aws_secret_access_key: "os.environ/AWS_SECRET_ACCESS_KEY"
      aws_region_name: "us-east-1"
```

## Polly Engines

AWS Polly supports different speech synthesis engines. Specify the engine in the model name:

| Model | Engine | Cost (per 1M chars) | Description |
|-------|--------|---------------------|-------------|
| `aws_polly/standard` | Standard | $4.00 | Original Polly voices, faster and lowest cost |
| `aws_polly/neural` | Neural | $16.00 | More natural, human-like speech (recommended) |
| `aws_polly/generative` | Generative | $30.00 | Most expressive, highest quality (limited voices) |
| `aws_polly/long-form` | Long-form | $100.00 | Optimized for long content like articles |

### **Linten SDK**

```python showLineNumbers title="Using Different Engines"
import linten

# Neural engine (recommended)
response = linten.speech(
    model="aws_polly/neural",
    voice="Joanna",
    input="Hello world",
)

# Standard engine (lower cost)
response = linten.speech(
    model="aws_polly/standard",
    voice="Joanna",
    input="Hello world",
)

# Generative engine (highest quality)
response = linten.speech(
    model="aws_polly/generative",
    voice="Matthew",
    input="Hello world",
)
```

### **Linten PROXY**

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
  - model_name: polly-neural
    linten_params:
      model: aws_polly/neural
      aws_region_name: "us-east-1"
  - model_name: polly-standard
    linten_params:
      model: aws_polly/standard
      aws_region_name: "us-east-1"
  - model_name: polly-generative
    linten_params:
      model: aws_polly/generative
      aws_region_name: "us-east-1"
```

## Available Voices

### Native Polly Voices

AWS Polly has many voices across different languages. Here are popular US English voices:

| Voice | Gender | Engine Support |
|-------|--------|----------------|
| `Joanna` | Female | Neural, Standard |
| `Matthew` | Male | Neural, Standard, Generative |
| `Ivy` | Female (child) | Neural, Standard |
| `Kendra` | Female | Neural, Standard |
| `Amy` | Female (British) | Neural, Standard |
| `Brian` | Male (British) | Neural, Standard |

### **Linten SDK**

```python showLineNumbers title="Using Native Polly Voices"
import linten

# US English female
response = linten.speech(
    model="aws_polly/neural",
    voice="Joanna",
    input="Hello from Joanna",
)

# US English male
response = linten.speech(
    model="aws_polly/neural",
    voice="Matthew",
    input="Hello from Matthew",
)

# British English female
response = linten.speech(
    model="aws_polly/neural",
    voice="Amy",
    input="Hello from Amy",
)
```

### **Linten PROXY**

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
  - model_name: polly-joanna
    linten_params:
      model: aws_polly/neural
      voice: "Joanna"
      aws_region_name: "us-east-1"
  - model_name: polly-matthew
    linten_params:
      model: aws_polly/neural
      voice: "Matthew"
      aws_region_name: "us-east-1"
```

### OpenAI Voice Mappings

Linten also supports OpenAI voice names, which are automatically mapped to Polly voices:

| OpenAI Voice | Maps to Polly Voice |
|--------------|---------------------|
| `alloy` | Joanna |
| `echo` | Matthew |
| `fable` | Amy |
| `onyx` | Brian |
| `nova` | Ivy |
| `shimmer` | Kendra |

### **Linten SDK**

```python showLineNumbers title="Using OpenAI Voice Names"
import linten

# These are equivalent
response = linten.speech(
    model="aws_polly/neural",
    voice="alloy",  # Maps to Joanna
    input="Hello world",
)

response = linten.speech(
    model="aws_polly/neural",
    voice="Joanna",  # Native Polly voice
    input="Hello world",
)
```

## SSML Support

AWS Polly supports SSML (Speech Synthesis Markup Language) for advanced control over speech output. Linten automatically detects SSML input.

### **Linten SDK**

```python showLineNumbers title="SSML Example"
import linten

ssml_input = """
<speak>
    Hello, <break time="500ms"/> 
    this is a test with <emphasis level="strong">emphasis</emphasis> 
    and <prosody rate="slow">slower speech</prosody>.
</speak>
"""

response = linten.speech(
    model="aws_polly/neural",
    voice="Joanna",
    input=ssml_input,
)
```

### **Linten PROXY**

```bash showLineNumbers title="cURL Request with SSML"
curl -X POST http://localhost:4000/v1/audio/speech \
  -H "Authorization: Bearer $LINTEN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "polly-neural",
    "voice": "Joanna",
    "input": "<speak>Hello <break time=\"500ms\"/> world</speak>"
  }' \
  --output speech.mp3
```

## Supported Parameters

```python showLineNumbers title="All Parameters"
response = linten.speech(
    model="aws_polly/neural",
    voice="Joanna",                    # Required: Voice selection
    input="text to convert",           # Required: Input text (or SSML)
    response_format="mp3",             # Optional: mp3, ogg_vorbis, pcm
    
    # AWS-specific parameters
    language_code="en-US",             # Optional: Language code
    sample_rate="22050",               # Optional: Sample rate in Hz
)
```

## Response Formats

| Format | Description |
|--------|-------------|
| `mp3` | MP3 audio (default) |
| `ogg_vorbis` | Ogg Vorbis audio |
| `pcm` | Raw PCM audio |

### **Linten SDK**

```python showLineNumbers title="Different Response Formats"
import linten

# MP3 (default)
response = linten.speech(
    model="aws_polly/neural",
    voice="Joanna",
    input="Hello",
    response_format="mp3",
)

# Ogg Vorbis
response = linten.speech(
    model="aws_polly/neural",
    voice="Joanna",
    input="Hello",
    response_format="ogg_vorbis",
)
```

## AWS Authentication

Linten supports multiple AWS authentication methods.

### **Linten SDK**

```python showLineNumbers title="Authentication Options"
import linten
import os

# Option 1: Environment variables (recommended)
os.environ["AWS_ACCESS_KEY_ID"] = "your-access-key"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-secret-key"
os.environ["AWS_REGION_NAME"] = "us-east-1"

response = linten.speech(model="aws_polly/neural", voice="Joanna", input="Hello")

# Option 2: Pass credentials directly
response = linten.speech(
    model="aws_polly/neural",
    voice="Joanna",
    input="Hello",
    aws_access_key_id="your-access-key",
    aws_secret_access_key="your-secret-key",
    aws_region_name="us-east-1",
)

# Option 3: IAM Role (when running on AWS)
response = linten.speech(
    model="aws_polly/neural",
    voice="Joanna",
    input="Hello",
    aws_region_name="us-east-1",
)

# Option 4: AWS Profile
response = linten.speech(
    model="aws_polly/neural",
    voice="Joanna",
    input="Hello",
    aws_profile_name="my-profile",
)
```

### **Linten PROXY**

```yaml showLineNumbers title="proxy_config.yaml"
model_list:
  # Using environment variables
  - model_name: polly-neural
    linten_params:
      model: aws_polly/neural
      aws_access_key_id: "os.environ/AWS_ACCESS_KEY_ID"
      aws_secret_access_key: "os.environ/AWS_SECRET_ACCESS_KEY"
      aws_region_name: "us-east-1"
  
  # Using IAM Role (when proxy runs on AWS)
  - model_name: polly-neural-iam
    linten_params:
      model: aws_polly/neural
      aws_region_name: "us-east-1"
  
  # Using AWS Profile
  - model_name: polly-neural-profile
    linten_params:
      model: aws_polly/neural
      aws_profile_name: "my-profile"
```

## Async Support

```python showLineNumbers title="Async Usage"
import linten
import asyncio

async def main():
    response = await linten.aspeech(
        model="aws_polly/neural",
        voice="Joanna",
        input="Hello from async AWS Polly",
        aws_region_name="us-east-1",
    )
    
    with open("output.mp3", "wb") as f:
        f.write(response.content)

asyncio.run(main())
```
