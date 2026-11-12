---
title: Models and routing
sidebar_label: Models and routing
---

# Models and routing

`model=` follows the same convention as `linten.completion`. A model prefixed with `linten_proxy/` goes to the gateway, and anything else is called directly through the Linten SDK.

## Gateway mode

With `model="linten_proxy/coder"`, `coder` is a model group on the gateway. The gateway address and virtual key come from `api_base=` and `api_key=` on the call, or from `LINTEN_PROXY_API_BASE` and `LINTEN_PROXY_API_KEY`. Setting `linten.use_linten_proxy = True` sends every call to the gateway, even without the prefix. A gateway model with no base URL or key raises `ValueError` at call time. Load balancing, fallbacks and rate limits on the key all happen on the gateway. See [Using with Linten AI Gateway](./gateway.md).

## SDK mode

`model` is any Linten model string, and the provider key is read on your host the same way `linten.completion` reads it.

```python
linten.agent(Harness.CODEX, task, sandbox=box, model="bedrock/us.anthropic.claude-sonnet-4-5-20250929-v1:0")

linten.agent(
    Harness.CLAUDE_CODE, task, sandbox=box,
    model="hosted_vllm/qwen3-coder",
    api_base="http://gpu-01:8000/v1",
)
```

In SDK mode `api_key=` and `api_base=` apply to the provider. With `model=None`, CLI runtimes use their own default model name. Tool Loop requires an explicit model

## The local model endpoint

The CLI harnesses need an HTTP endpoint to call. For each session, `linten.agent()` starts a small Starlette app on `127.0.0.1` with a random port, makes it reachable from the sandbox, and points the runtime at it.

| Harness | Configured with | Route | Gateway mode | SDK mode |
|---|---|---|---|---|
| `CLAUDE_CODE` | `ANTHROPIC_BASE_URL` | `/v1/messages` | forwarded to gateway | `linten.anthropic.messages.acreate` |
| `CODEX` | `model_providers.linten` | `/v1/responses` | forwarded to gateway | `linten.aresponses` |
| `OPENCODE` | `linten` provider in `opencode.json` | `/v1/chat/completions` | forwarded to gateway | `linten.acompletion` |

The runtime's API key is a random per-session token. The endpoint rejects any other token with 401, and the token stops working when the session closes. In gateway mode the endpoint swaps the token for your virtual key, adds `x-linten-tags: harness,<name>`, sends `metadata=` as `x-linten-spend-logs-metadata`, and streams responses through unchanged.

Deep Agents and Tool Loop run in your process and don't use the endpoint. Deep Agents uses a `ChatLinten` model, while Tool Loop calls `linten.acompletion()` directly

## Cost and usage

`Result.usage` has `input_tokens`, `output_tokens`, `calls` and `total_tokens`, and `Result.cost` is in USD. `Session.cost` is the running total. In gateway mode cost comes from the gateway's `x-linten-response-cost` header, so it matches the gateway's spend logs. In SDK mode it's computed from Linten's model cost map, and counts as 0.0 for models without a price.
