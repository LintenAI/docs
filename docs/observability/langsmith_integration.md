import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LangSmith



An all-in-one developer platform for every step of the application lifecycle
https://smith.langchain.com/

<Image img={require('../../img/langsmith_new.png')} />

:::info
We want to learn how we can make the callbacks better! Meet the Linten [founders](https://calendly.com/d/4mp-gd3-k5k/lintenai-1-1-onboarding-linten-hosted-version) or
join our [discord](https://discord.gg/wuPM9dRgDw)
::: 

## Pre-Requisites
```shell
uv add linten
```

## Quick Start
Use just 2 lines of code, to instantly log your responses **across all providers** with Langsmith

<Tabs>
<TabItem value="python" label="SDK">

```python
linten.callbacks = ["langsmith"]
```

```python
import linten
import os

os.environ["LANGSMITH_API_KEY"] = ""
os.environ["LANGSMITH_PROJECT"] = "" # defaults to linten-completion
os.environ["LANGSMITH_DEFAULT_RUN_NAME"] = "" # defaults to LLMRun
# LLM API Keys
os.environ['OPENAI_API_KEY']=""

# set langsmith as a callback, linten will send the data to langsmith
linten.callbacks = ["langsmith"] 
 
# openai call
response = linten.completion(
  model="{{openai_small}}",
  messages=[
    {"role": "user", "content": "Hi - i'm openai"}
  ]
)
```
</TabItem>
<TabItem value="proxy" label="Linten Proxy">

1. Setup config.yaml
```yaml
model_list:
  - model_name: {{openai_small}}
    linten_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

linten_settings:
  callbacks: ["langsmith"]
```

2. Start Linten Proxy
```bash
linten --config /path/to/config.yaml
```

3. Test it!
```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-eWkpOhYaHiuIZV-29JDeTQ' \
-d '{
  "model": "{{openai_small}}",
  "messages": [
    {
      "role": "user",
      "content": "Hey, how are you?"
    }
  ],
  "max_completion_tokens": 250
}'
```
</TabItem>
</Tabs>



## Advanced

### Local Testing - Control Batch Size

Set the size of the batch that Langsmith will process at a time, default is 512. 

Set `langsmith_batch_size=1` when testing locally, to see logs land quickly.

<Tabs>
<TabItem value="python" label="SDK">

```python
import linten
import os

os.environ["LANGSMITH_API_KEY"] = ""
# LLM API Keys
os.environ['OPENAI_API_KEY']=""

# set langsmith as a callback, linten will send the data to langsmith
linten.callbacks = ["langsmith"] 
linten.langsmith_batch_size = 1 # KEY CHANGE
 
response = linten.completion(
    model="{{openai_small}}",
     messages=[
        {"role": "user", "content": "Hi - i'm openai"}
    ]
)
print(response)
```
</TabItem>
<TabItem value="proxy" label="Linten Proxy">

1. Setup config.yaml
```yaml
model_list:
  - model_name: {{openai_small}}
    linten_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

linten_settings:
  langsmith_batch_size: 1
  callbacks: ["langsmith"]
```

2. Start Linten Proxy
```bash
linten --config /path/to/config.yaml
```

3. Test it!
```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer sk-eWkpOhYaHiuIZV-29JDeTQ' \
-d '{
  "model": "{{openai_small}}",
  "messages": [
    {
      "role": "user",
      "content": "Hey, how are you?"
    }
  ],
  "max_completion_tokens": 250
}'
```



</TabItem>
</Tabs>




### Set Langsmith fields

```python
import linten
import os

os.environ["LANGSMITH_API_KEY"] = ""
# LLM API Keys
os.environ['OPENAI_API_KEY']=""

# set langsmith as a callback, linten will send the data to langsmith
linten.success_callback = ["langsmith"] 
 
response = linten.completion(
    model="{{openai_small}}",
     messages=[
        {"role": "user", "content": "Hi - i'm openai"}
    ],
    metadata={
        "run_name": "lintenRUN",                                   # langsmith run name
        "project_name": "linten-completion",                       # langsmith project name
        "run_id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",           # langsmith run id
        "parent_run_id": "f8faf8c1-9778-49a4-9004-628cdb0047e5",    # langsmith run parent run id
        "trace_id": "df570c03-5a03-4cea-8df0-c162d05127ac",         # langsmith run trace id (root runs override this, see note below)
        "session_id": "1ffd059c-17ea-40a8-8aef-70fd0307db82",       # langsmith run session id (must be an existing tracer session)
        "tags": ["model1", "prod-2"],                               # langsmith run tags
        "metadata": {                                               # langsmith run metadata
            "key1": "value1"
        },
        "dotted_order": "20240429T004912090000Z497f6eca-6276-4993-bfeb-53cbbbba6f08"
    }
)
print(response)
```

A run that posts as a root, meaning it carries neither `parent_run_id` nor `dotted_order`, gets its `trace_id` set to the run id so the batch passes LangSmith's dotted_order validation. Supply `parent_run_id` or `dotted_order` to keep your own `trace_id`. `session_id` must reference a tracer session that already exists in LangSmith and is ignored when it equals `trace_id`, because that shape is produced by the proxy's request-header fan-out rather than a deliberate session

### Make Linten Proxy use Custom `LANGSMITH_BASE_URL`

If you're using a custom LangSmith instance, you can set the
`LANGSMITH_BASE_URL` environment variable to point to your instance.
For example, you can make Linten Proxy log to a local LangSmith instance with
this config:

```yaml
linten_settings:
  success_callback: ["langsmith"]

environment_variables:
  LANGSMITH_BASE_URL: "http://localhost:1984"
  LANGSMITH_PROJECT: "linten-proxy"
```

## Support & Talk to Founders

- [Schedule Demo](https://calendly.com/d/4mp-gd3-k5k/lintenai-1-1-onboarding-linten-hosted-version)
- [Community Discord](https://discord.gg/wuPM9dRgDw)
- Our emails ishaan@berri.ai / krrish@berri.ai
