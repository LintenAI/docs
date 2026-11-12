# Linten Keys (community key, discontinued)

The free community `sk-linten-...` keys and the hosted proxy behind them are no longer available. The Linten SDK has no special handling for these keys, so setting `OPENAI_API_KEY` (or any other provider key) to an `sk-linten-...` value sends it straight to that provider, which rejects it with an authentication error

To get one key for many providers, run your own [Linten Proxy](./proxy/quick_start.md) with your provider credentials, then call it from the SDK through the [`linten_proxy/` provider](./providers/linten_proxy.md) using a key issued by your proxy

```python
import os
from linten import completion

os.environ["LINTEN_PROXY_API_BASE"] = "http://0.0.0.0:4000"  # your proxy
os.environ["LINTEN_PROXY_API_KEY"] = os.environ["LINTEN_API_KEY"]

messages = [{"content": "Hello, how are you?", "role": "user"}]

response = completion(model="linten_proxy/{{openai_small}}", messages=messages)
```

The `linten_proxy/` prefix works the same way in tools built on the Linten SDK, as long as `LINTEN_PROXY_API_BASE` points at your proxy. For every model and provider you can call, see the [provider list](./providers/) or [models.linten.ai](https://models.linten.ai/)
