import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Raw Request/Response Logging


## Logging
See the raw request/response sent by Linten in your logging provider (OTEL/Langfuse/etc.).

<Tabs>
<TabItem value="sdk" label="SDK">

```python
# uv add langfuse 
import linten
import os

# log raw request/response
linten.log_raw_request_response = True

# from https://cloud.langfuse.com/
os.environ["LANGFUSE_PUBLIC_KEY"] = ""
os.environ["LANGFUSE_SECRET_KEY"] = ""
# Optional, defaults to https://cloud.langfuse.com
os.environ["LANGFUSE_HOST"] # optional

# LLM API Keys
os.environ['OPENAI_API_KEY']=""

# set langfuse as a callback, linten will send the data to langfuse
linten.success_callback = ["langfuse"] 
 
# openai call
response = linten.completion(
  model="{{openai_small}}",
  messages=[
    {"role": "user", "content": "Hi - i'm openai"}
  ]
)
```


</TabItem>
<TabItem value="proxy" label="PROXY">


```yaml
linten_settings:
  log_raw_request_response: True
```


</TabItem>
</Tabs>

**Expected Log**

<Image img={require('../../img/raw_request_log.png')}/>


## Return Raw Response Headers 

Return raw response headers from llm provider. 

Currently only supported for openai. 

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import linten
import os

linten.return_response_headers = True

## set ENV variables
os.environ["OPENAI_API_KEY"] = "your-api-key"

response = linten.completion(
  model="{{openai_small}}",
  messages=[{ "content": "Hello, how are you?","role": "user"}]
)

print(response._hidden_params)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. Setup config.yaml

```yaml
model_list:
  - model_name: {{openai_small}}
    linten_params:
      model: {{openai_small}}
      api_key: os.environ/GROQ_API_KEY

linten_settings:
  return_response_headers: true
```

2. Test it!

```bash
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LINTEN_API_KEY" \
-D '{
    "model": "{{openai_small}}",
    "messages": [
        { "role": "system", "content": "Use your tools smartly"},
        { "role": "user", "content": "What time is it now? Use your tool"}
    ]
}'
```
</TabItem>
</Tabs>


**Expected Response**

<Image img={require('../../img/raw_response_headers.png')}/>