---
description: Linten signs the Docker images it publishes to GHCR with cosign, starting with v1.83.0. How to verify signatures, enforce verification in CI/CD, and follow recommended deployment patterns.
---

# Docker Image Security Guide

Linten signs every Docker image it publishes to GHCR with [cosign](https://docs.sigstore.dev/quickstart/quickstart-cosign/) <SinceVersion v="1.83.0" />. Older images are not signed. This page covers how to verify signatures, enforce verification in CI/CD, and follow recommended deployment patterns.

## Signed images

All image variants published to `ghcr.io/lintenai/` are signed with the same cosign key:

| Image | Description |
|---|---|
| `ghcr.io/lintenai/linten` | Core proxy, including the Prisma toolchain for Postgres |
| `ghcr.io/lintenai/linten-non_root` | Non-root variant |
| `ghcr.io/lintenai/linten-spend_logs` | Spend-logs sidecar |
| `ghcr.io/lintenai/linten-database` | Legacy alias of `linten`, kept for existing deployments |

:::note[`linten-database` is a legacy alias]
`ghcr.io/lintenai/linten-database` used to be the image to pick when the proxy needed Postgres, because it bundled the Prisma toolchain that the core image lacked. `ghcr.io/lintenai/linten` now ships the same toolchain, entrypoint and migrations, so there is no longer a reason to choose between them. `linten-database` is still published and signed with the same key, so deployments that pin it keep working and verify with the same commands. Use `ghcr.io/lintenai/linten` for new deployments; the examples on this page use it throughout.
:::

The current signing key was introduced in [commit `e82a3c6`](https://github.com/LintenAI/linten/commit/e82a3c646908ba0a6ee0beddc4310d7a6cac4065) and the public key is checked into the repository at [`cosign.pub`](https://github.com/LintenAI/linten/blob/main/cosign.pub). Its SHA-256 fingerprint is `e3fe3e08c44b16407fe0b37c43b4f8b603b3a0f4ee74c29e647bc022d762c2c0`. It signs images from `v1.103.8`, `v1.104.6`, `v1.105.4`, `v1.106.3` and every later release.

:::warning[Previous signing key]
Earlier images are signed with the previous key from [commit `0112e53`](https://github.com/LintenAI/linten/commit/0112e53046018d726492c814b3644b7d376029d0). That key was rotated on October 23, 2026, after the [October 21, 2026 incident](/blog/security-incident-oct-21-2026#image-signing-key-rotation). Trust a signature from it only on an image published before the `v1.107.0` release on October 21, 2026.
:::

:::info[Enterprise images]
Enterprise images (`linten-ee`) follow the same signing process. Contact [support@berri.ai](mailto:support@berri.ai) to confirm coverage for your specific enterprise image tag.
:::

## Verify image signatures

Install cosign following the [official instructions](https://docs.sigstore.dev/cosign/system_config/installation/).

### Verify with the pinned commit hash (recommended)

A commit hash is cryptographically immutable, making this the strongest verification method:

```bash
cosign verify \
  --key https://raw.githubusercontent.com/LintenAI/linten/e82a3c646908ba0a6ee0beddc4310d7a6cac4065/cosign.pub \
  ghcr.io/lintenai/linten:v1.106.6
```

Replace the image reference with any signed variant:

```bash
# linten-non_root
cosign verify \
  --key https://raw.githubusercontent.com/LintenAI/linten/e82a3c646908ba0a6ee0beddc4310d7a6cac4065/cosign.pub \
  ghcr.io/lintenai/linten-non_root:v1.106.6
```

### Verify with a release tag (convenience)

Tags are protected in this repository and resolve to the same key:

```bash
cosign verify \
  --key https://raw.githubusercontent.com/LintenAI/linten/v1.106.6/cosign.pub \
  ghcr.io/lintenai/linten:v1.106.6
```

### Expected output

```
The following checks were performed on each of these signatures:
  - The cosign claims were validated
  - The signatures were verified against the specified public key
```

## Enforce verification in CI/CD

### Kubernetes: Sigstore Policy Controller

The [Sigstore Policy Controller](https://docs.sigstore.dev/policy-controller/overview/) rejects pods whose images fail cosign verification.

1. Install the controller:

```bash
helm repo add sigstore https://sigstore.github.io/helm-charts
helm install policy-controller sigstore/policy-controller \
  -n cosign-system --create-namespace
```

2. Create a `ClusterImagePolicy` with the Linten public key:

```yaml
apiVersion: policy.sigstore.dev/v1beta1
kind: ClusterImagePolicy
metadata:
  name: linten-signed-images
spec:
  images:
    - glob: "ghcr.io/lintenai/linten*"
  authorities:
    - key:
        data: |
          -----BEGIN PUBLIC KEY-----
          MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEG06dpKM+vEDnmp2zcjyXgVCXxzRg
          JA5H2LnmwBKQafZGka6OOrWujCEWATQewiAgyD4WQdJ0pvU9RC4mvNAjvQ==
          -----END PUBLIC KEY-----
```

3. Label the namespace to enable enforcement:

```bash
kubectl label namespace linten policy.sigstore.dev/include=true
```

Any pod in that namespace using an unsigned `ghcr.io/lintenai/linten*` image will be rejected at admission.

### GCP: Binary Authorization

[Binary Authorization](https://cloud.google.com/binary-authorization/docs) can enforce cosign signatures on Cloud Run and GKE.

1. Create a cosign-based attestor using the Linten public key:

```bash
# Import the public key into a Cloud KMS keyring or use a PGP/PKIX attestor.
# See: https://cloud.google.com/binary-authorization/docs/creating-attestors-console
```

2. Configure a Binary Authorization policy that requires the attestor for `ghcr.io/lintenai/linten*` images.

3. Enable the policy on your Cloud Run service or GKE cluster.

Refer to the [GCP Binary Authorization docs](https://cloud.google.com/binary-authorization/docs/setting-up) for full setup steps.

### AWS: ECS / ECR

AWS does not natively verify cosign signatures at deploy time. Common approaches:

- **CI/CD gate**: Run `cosign verify` in your deployment pipeline before pushing to ECR or updating the ECS task definition. Fail the pipeline if verification fails.
- **OPA/Gatekeeper on EKS**: If running on EKS, use the Sigstore Policy Controller (same as the Kubernetes approach above).

### GitHub Actions gate

Add a verification step before any deployment job:

```yaml
- name: Verify Linten image signature
  run: |
    cosign verify \
      --key https://raw.githubusercontent.com/LintenAI/linten/e82a3c646908ba0a6ee0beddc4310d7a6cac4065/cosign.pub \
      ghcr.io/lintenai/linten:${{ env.LINTEN_VERSION }}
```

## Recommended deployment patterns

### Pin by digest

Digest pinning guarantees the exact image content regardless of tag mutations:

```yaml
image: ghcr.io/lintenai/linten@sha256:<digest>
```

Get the digest after pulling:

```bash
docker inspect --format='{{index .RepoDigests 0}}' \
  ghcr.io/lintenai/linten:v1.106.6
```

Cosign verification works with digests too:

```bash
cosign verify \
  --key https://raw.githubusercontent.com/LintenAI/linten/e82a3c646908ba0a6ee0beddc4310d7a6cac4065/cosign.pub \
  ghcr.io/lintenai/linten@sha256:<digest>
```

### Use stable release tags

If digest pinning is too rigid for your workflow, use plain semver / PEP 440 release tags (e.g. `v1.86.2`). These are immutable release tags that will not be overwritten.

:::warning[`main-stable` and `main-latest` are deprecated]

Linten has moved to PEP 440 / semver versioning, so stable releases are now published as plain `vX.Y.Z` tags (e.g. `v1.86.2`) instead of the older `vX.Y.Z-stable` form. The rolling `main-stable` tag is still being updated for backwards compatibility but is deprecated; pin to a specific `vX.Y.Z` tag (or a digest) instead. The rolling `main-latest` tag is deprecated and is no longer being updated; use `latest` instead.
:::

Avoid `latest` in production. This rolling tag points to the most recent build and can change between deployments.

### Safe upgrade checklist

1. **Verify the new image** — run `cosign verify` against the new release tag or digest.
2. **Test in staging** — deploy the verified image to a non-production environment.
3. **Update your pinned reference** — change the digest or tag in your deployment manifest.
4. **Deploy to production** — roll out using your standard deployment process.
5. **Monitor `/health`** — confirm the proxy is healthy after the upgrade.

## Further reading

- [CI/CD v2 announcement](https://docs.linten.ai/blog/ci-cd-v2-improvements) — background on Linten's signing infrastructure
- [Docker deployment guide](./deploy.md) — full Docker, Helm, and Terraform setup
- [cosign documentation](https://docs.sigstore.dev/quickstart/quickstart-cosign/) — cosign usage and key management
- [Sigstore Policy Controller](https://docs.sigstore.dev/policy-controller/overview/) — Kubernetes admission control
