import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Billable Request Metering

Linten Enterprise [pricing is usage-based](../enterprise#how-is-pricing-structured). Billable request metering reports that usage. The proxy counts successful requests to LLM, MCP, and A2A endpoints and pushes one OpenTelemetry counter to Linten's collector, authenticated with the mTLS client certificate issued for your deployment.

Only the request count is sent. Prompts, responses, and virtual keys never leave the deployment. The license key is sent to the Linten license server only when the gateway's offline check of its signature does not pass, see [Activate your license](../enterprise/activate.md). Metering runs separately from any [OTEL logging](../observability/opentelemetry_integration) you configure and never touches your own metrics pipeline.

:::info

You need a `LINTEN_LICENSE` and metering credentials (`client.crt` and `client.key`) from your Linten onboarding. Missing either? [Contact us](https://enterprise.linten.ai/demo).

:::

## Quick Start

### 1. Set environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LINTEN_BILLING_METRICS_ENDPOINT` | Yes | Collector URL. Use `https://telemetry.linten.ai` |
| `LINTEN_BILLING_METRICS_CLIENT_CERT` | Yes | mTLS client certificate. File path or inline PEM |
| `LINTEN_BILLING_METRICS_CLIENT_KEY` | Yes | Private key for the certificate. File path or inline PEM |
| `LINTEN_BILLING_METRICS_CA_CERT` | No | CA bundle for the collector. Leave unset for `telemetry.linten.ai` |
| `LINTEN_BILLING_METRICS_EXPORT_INTERVAL_MS` | No | Push interval in milliseconds. Default `60000` |

```bash
export LINTEN_LICENSE="eyJ..."
export LINTEN_BILLING_METRICS_ENDPOINT="https://telemetry.linten.ai"
export LINTEN_BILLING_METRICS_CLIENT_CERT="/etc/linten/billing-mtls/client.crt"
export LINTEN_BILLING_METRICS_CLIENT_KEY="/etc/linten/billing-mtls/client.key"
```

The certificate variables accept a file path or the PEM content itself. Use inline PEM when your secret store injects values as environment variables and cannot mount files, for example ECS with AWS Secrets Manager or Cloud Run with Secret Manager.

You can also set these in the config file:

```yaml
environment_variables:
  LINTEN_BILLING_METRICS_ENDPOINT: "https://telemetry.linten.ai"
  LINTEN_BILLING_METRICS_CLIENT_CERT: "-----BEGIN CERTIFICATE-----\n..."
  LINTEN_BILLING_METRICS_CLIENT_KEY: "-----BEGIN PRIVATE KEY-----\n..."
```

### 2. Start the proxy

```bash
linten --config config.yaml
```

### 3. Verify

The line below is logged at INFO level, so it only shows when the proxy runs with `LINTEN_LOG=INFO` (or `--detailed_debug`). Send a request through the proxy, then check the logs for:

```
Enterprise billing metrics enabled: exporting to https://telemetry.linten.ai every 60000 ms
```

If this line is missing, look for a warning naming the misconfigured variable. Metering problems never affect request serving. On any error the exporter is disabled and the proxy runs normally.

## Deploy

<Tabs>
<TabItem value="helm" label="Helm">

Both the [standard chart](https://github.com/LintenAI/linten/tree/main/helm/linten-helm) and the [microservices chart](./deploy#deploy-with-helm) have a `billingMetrics` block, off by default.

1. Create a TLS Secret from your issued certificate:

```bash
kubectl create secret tls linten-billing-metrics-mtls --cert=client.crt --key=client.key
```

2. Enable metering in your values:

```yaml
billingMetrics:
  enabled: true
```

The chart looks for the Secret name `linten-billing-metrics-mtls` by default.

| Value | Default | Description |
|-------|---------|-------------|
| `billingMetrics.enabled` | `false` | Enable metering |
| `billingMetrics.endpoint` | `https://telemetry.linten.ai` | Collector URL |
| `billingMetrics.secretName` | `linten-billing-metrics-mtls` | Existing TLS Secret with `tls.crt` and `tls.key` |
| `billingMetrics.caSecretName` | `""` | Existing Secret with `ca.crt`. Leave empty for the default collector |
| `billingMetrics.exportIntervalMs` | `""` | Push interval. The proxy defaults to `60000` |

</TabItem>
<TabItem value="terraform" label="Terraform (AWS / GCP)">

The reference stacks at [`terraform/linten/aws`](https://github.com/LintenAI/linten/tree/main/terraform/linten/aws) (ECS Fargate) and [`terraform/linten/gcp`](https://github.com/LintenAI/linten/tree/main/terraform/linten/gcp) (Cloud Run) enable metering when `billing_metrics_endpoint` is set:

```hcl
billing_metrics_endpoint = "https://telemetry.linten.ai"
```

```bash
export TF_VAR_billing_metrics_client_cert_pem="$(cat client.crt)"
export TF_VAR_billing_metrics_client_key_pem="$(cat client.key)"
```

The stack stores the certificate and key in Secrets Manager (AWS) or Secret Manager (GCP) and injects them as environment variables. No volume is needed.

</TabItem>
<TabItem value="docker" label="Docker">

```bash
docker run \
  -e LINTEN_LICENSE="eyJ..." \
  -e LINTEN_BILLING_METRICS_ENDPOINT="https://telemetry.linten.ai" \
  -e LINTEN_BILLING_METRICS_CLIENT_CERT="$(cat client.crt)" \
  -e LINTEN_BILLING_METRICS_CLIENT_KEY="$(cat client.key)" \
  -v $(pwd)/config.yaml:/app/config.yaml \
  -p 4000:4000 \
  ghcr.io/lintenai/linten:main-stable \
  --config /app/config.yaml
```

</TabItem>
</Tabs>

## What counts as billable

A request counts when it returns a 2xx status on an LLM inference endpoint (chat completions, embeddings, responses, images, audio, and the other inference routes), the MCP transport, or the A2A `message/send` route. GET reads, management endpoints, health probes, and failed requests do not count.

The count lines up with the **successful requests** number on the Admin UI usage page.

## FAQ

**Does this affect proxy performance?** No meaningful impact at the default settings. The per-request cost is about 1.6 microseconds.

**What if the collector is unreachable?** Requests are unaffected. The counter is cumulative, so counts recorded during an outage are included in the next successful export.

**What happens on restart?** The proxy flushes the counter on shutdown, so no counts are lost.

**Air-gapped deployments?** Metering needs outbound HTTPS to the collector. If your deployment cannot reach it, talk to us during onboarding.
