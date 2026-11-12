# Why Pass-Through Endpoints?

These endpoints are useful for 2 scenarios:

1. **Migrate existing projects** to linten proxy. E.g: If you have users already in production with Anthropic's SDK, you just need to change the base url to get cost tracking/logging/budgets/etc. 


2. **Use provider-specific endpoints** E.g: If you want to use [Vertex AI's token counting endpoint](https://docs.linten.ai/docs/pass_through/vertex_ai#count-tokens-api)


## How is your request handled? 

The request is passed through to the provider's endpoint. The response is then passed back to the client. **No translation is done.**

### Request Forwarding Process

1. **Request Reception**: Linten receives your request at `/provider/endpoint`
2. **Authentication**: Your Linten API key is validated and mapped to the provider's API key
3. **Request Transformation**: Request is reformatted for the target provider's API
4. **Forwarding**: Request is sent to the actual provider endpoint
5. **Response Handling**: Provider response is returned directly to you

### Authentication Flow

```mermaid
graph LR
    A[Client Request] --> B[Linten Proxy]
    B --> C[Validate Linten API Key]
    C --> D[Map to Provider API Key]
    D --> E[Forward to Provider]
    E --> F[Return Response]
```

**Key Points:**
- Use your **Linten API key** in requests, not the provider's key
- Linten handles the provider authentication internally
- Same authentication works across all passthrough endpoints

### Error Handling

**Provider Errors**: Forwarded directly to you with original error codes and messages

**Linten Errors**: 
- `401`: Invalid Linten API key
- `404`: Provider or endpoint not supported
- `500`: Internal routing/forwarding errors

### Benefits

- **Unified Authentication**: One API key for all providers
- **Centralized Logging**: All requests logged through Linten
- **Cost Tracking**: Tracked where the provider page's overview table says so. A custom pass-through target that Linten cannot price can report its own totals, see [Pass-Through Cost & Usage Tracking](../proxy/pass_through_cost_tracking.md). Anything else is logged without cost
- **Access Control**: Same permissions apply to passthrough endpoints
