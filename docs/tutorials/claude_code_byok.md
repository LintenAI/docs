# Claude Code with Bring Your Own Key (BYOK)

Use Claude Code with your own Anthropic credentials through the Linten proxy. Claude Code authenticates to Anthropic one of two ways: `/login` sends an OAuth token as `Authorization: Bearer <token>` (tied to your Claude.ai Free, Pro, Max, or Enterprise seat), while a configured Anthropic API key is sent as `x-api-key`. Linten forwards either credential to Anthropic instead of using proxy-configured keys, so you pay Anthropic directly while still benefiting from Linten's routing, logging, and guardrails.

## How It Works

1. **Claude Code authentication**: with `/login`, Claude Code sends your Anthropic OAuth token as `Authorization: Bearer <token>`; with a configured API key, it sends `x-api-key` instead.
2. **Linten authentication**: you pass your Linten proxy key via `ANTHROPIC_CUSTOM_HEADERS` (e.g. `x-linten-api-key`) so the proxy can authenticate and track your usage without touching the Anthropic credential headers above.
3. **Key forwarding**: Linten forwards the OAuth `Authorization` header to Anthropic automatically. The `x-api-key` path additionally needs `forward_llm_provider_auth_headers: true`, since Linten strips `x-api-key` by default.

## Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) installed
- Anthropic API key (from [console.anthropic.com](https://console.anthropic.com))
- Linten proxy with a virtual key for authentication

## Step 1: Configure Linten Proxy

If you're authenticating with an Anthropic API key rather than `/login`, enable forwarding of LLM provider auth headers so your key takes precedence:

```yaml title="config.yaml"
model_list:
  - model_name: {{anthropic}}
    linten_params:
      model: anthropic/{{anthropic}}
      # No api_key needed — client's key will be used

linten_settings:
  forward_llm_provider_auth_headers: true  # Required for the x-api-key path; not needed for /login
```

:::info[Why `forward_llm_provider_auth_headers`?]

By default, Linten strips `x-api-key` from client requests for security. Setting this to `true` allows a client-provided Anthropic API key to be forwarded to Anthropic, overriding any proxy-configured key. This setting only governs `x-api-key` and similar provider-key headers; it has no effect on `/login`, which authenticates via an `Authorization: Bearer` OAuth token that Linten forwards regardless of this setting, provided you authenticate to the proxy with a different header (such as `x-linten-api-key`) rather than `Authorization`.

:::

:::tip[Configure via UI instead of config.yaml]

You can also complete this setup from the Linten admin UI:

- Add the model via **Models → Add Model**, leaving the **API Key** field blank.
- Enable the toggle at **Settings → UI Settings → "Forward LLM provider auth headers"**.

Both UI actions write to the database and override `config.yaml` at runtime.

:::

## Step 2: Create a Linten Virtual Key

Create a virtual key in the Linten UI or via API. 
```bash
# Example: Create key via API
curl -X POST "http://localhost:4000/key/generate" \
  -H "Authorization: Bearer sk-your-master-key" \
  -H "Content-Type: application/json" \
  -d '{"key_alias": "claude-code-byok", "models": ["{{anthropic}}"]}'
```

## Step 3: Configure Claude Code

Set environment variables so Claude Code uses Linten and sends your Linten key for proxy auth:

```bash
# Point Claude Code to your Linten proxy
export ANTHROPIC_BASE_URL="http://localhost:4000"

# Model name from your config
export ANTHROPIC_MODEL="{{anthropic}}"

# Linten proxy auth: this is added to every request
# Use x-linten-api-key so the proxy authenticates you; your Anthropic credential goes
# via Authorization (from /login) or x-api-key (if you configured a key directly)
export ANTHROPIC_CUSTOM_HEADERS="x-linten-api-key: $LINTEN_API_KEY"
```

Replace `sk-<your-linten-api-key>` with your actual Linten virtual key.

:::tip[Multiple headers]

For multiple headers, use newline-separated values:

```bash
export ANTHROPIC_CUSTOM_HEADERS="x-linten-api-key: $LINTEN_API_KEY
x-linten-user-id: my-user-id"
```

:::

## Step 4: Sign In with Claude Code

1. Launch Claude Code:

   ```bash
   claude
   ```

2. Use **`/login`** and sign in with your Anthropic account (or use your API key directly).

3. Claude Code sends `x-linten-api-key` (your Linten key, from `ANTHROPIC_CUSTOM_HEADERS`) plus one of the following, depending on how you authenticated in step 2:
   - `Authorization: Bearer <oauth-token>`, if you used `/login`
   - `x-api-key`, if you configured an Anthropic API key directly

4. Linten authenticates you via `x-linten-api-key`. It forwards the OAuth `Authorization` header to Anthropic automatically; forwarding `x-api-key` additionally requires `forward_llm_provider_auth_headers: true`. Either way, your Anthropic credential takes precedence over any proxy-configured key.

## Summary

| Header | Source | Purpose | Needs `forward_llm_provider_auth_headers`? |
|--------|--------|---------|---------|
| `Authorization: Bearer <token>` | Claude Code `/login` (OAuth) | Sent to Anthropic for API calls | No, forwarded by default |
| `x-api-key` | Configured Anthropic API key | Sent to Anthropic for API calls | Yes |
| `x-linten-api-key` | `ANTHROPIC_CUSTOM_HEADERS` | Proxy authentication, tracking, rate limits | N/A |

## Troubleshooting

### Requests fail with "invalid x-api-key"

This applies to the configured-API-key path, not `/login`.

- Ensure `forward_llm_provider_auth_headers: true` is set in `linten_settings` (or `general_settings`).
- Restart the Linten proxy after changing the config.
- Verify your Anthropic API key is configured correctly on the client.

### Proxy returns 401

- Check that `ANTHROPIC_CUSTOM_HEADERS` includes `x-linten-api-key: <your-key>`.
- Ensure the Linten key is valid and has access to the model.

### Proxy key is used instead of my Anthropic key

This applies to the `x-api-key` path; the OAuth `Authorization` header from `/login` is forwarded regardless of this setting.

- Confirm `forward_llm_provider_auth_headers: true` is in your config.
- The setting can be in `linten_settings` or `general_settings` depending on your config structure.
- Enable debug logging: `LINTEN_LOG=DEBUG` to see which key is being forwarded.

### Model is unavailable for everyone after one user hits their limit

If a healthy account receives `429 No deployments available for selected model`, ask the proxy operator to check for an existing deployment cooldown. Wait for it to expire, or clear it with the steps below.

Recovery before expiry briefly interrupts proxy traffic. Have the proxy operator:

1. Stop all proxy workers that use the affected deployment.
2. If Redis is configured, remove only that deployment's `deployment:<model_id>:cooldown` key using your Redis management tool. Use the deployment's `model_info.id`, not its model name, and include the configured Redis namespace prefix if present. Preserve all other keys.
3. Start the proxy workers and send a request from a healthy account. Confirm it succeeds in **Logs**.

With Redis, restarting workers alone can reload the old entry. Without Redis, restarting all workers clears the in-memory cooldown. This recovery does not reset the provider's account quota.

## Related

- [Forward Client Headers](./../proxy/forward_client_headers.md) — Full BYOK and header forwarding docs
- [Claude Code Max Subscription](./claude_code_max_subscription.md) — Using Claude Code with OAuth/Max subscription through Linten
