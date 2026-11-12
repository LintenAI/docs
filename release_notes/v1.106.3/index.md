---
title: "Linten v1.106.3, v1.105.4 and v1.103.8 change the image-signing key and drop the eMudhra root CA"
description: "Images and Helm charts are signed with a new cosign key, and every certificate bundle drops the eMudhra root CA."
slug: "v1-106-3"
date: 2026-10-24T09:34:13
authors:
  - name: Krrish Dholakia
    title: CEO, Linten
    url: https://www.linkedin.com/in/krish-d/
    image_url: https://pbs.twimg.com/profile_images/1298587542745358340/DZv3Oj-h_400x400.jpg
  - name: Ishaan Jaff
    title: CTO, Linten
    url: https://www.linkedin.com/in/reffajnaahsi/
    image_url: https://pbs.twimg.com/profile_images/1613813310264340481/lz54oEiB_400x400.jpg
  - name: Yuneng Jiang
    title: Senior Full Stack Engineer, Linten
    url: https://www.linkedin.com/in/yuneng-david-jiang-455676139/
    image_url: https://avatars.githubusercontent.com/u/171294688?v=4
hide_table_of_contents: false
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Deploy this version

<Tabs>
<TabItem value="docker" label="Docker">

```bash
docker run \
-e LINTEN_MASTER_KEY=sk-<paste-a-long-random-key> \
-e DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<dbname> \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
docker.linten.ai/lintenai/linten:1.106.3
```

</TabItem>
<TabItem value="pip" label="Pip">

```bash
pip install linten==1.106.3
```

</TabItem>
</Tabs>

This release is published as [`ghcr.io/lintenai/linten:v1.106.3`](https://github.com/LintenAI/linten/pkgs/container/linten). See the [GitHub release](https://github.com/LintenAI/linten/releases/tag/v1.106.3) and the full [releases page](https://github.com/LintenAI/linten/releases)

`v1.106.3` is a patch release on top of [`v1.106.2`](/release_notes/v1.106.2/v1-106-2). It moves image signing to a new cosign key and removes the eMudhra root CA from every certificate bundle on `stable/1.106.x`. There are no new database migrations. The `v1.106.3` tag points at [`4fa8bf1`](https://github.com/LintenAI/linten/commit/4fa8bf1ff5515e2cb98908c62ba84c87ef938620)

:::warning The image-signing key has changed

Starting with this release, every Docker image and Helm chart is signed with the cosign key from commit [`e82a3c6`](https://github.com/LintenAI/linten/commit/e82a3c646908ba0a6ee0beddc4310d7a6cac4065). Verifying with the previous key from commit `0112e53` fails. Update anything that pins the old `cosign.pub`, such as `cosign verify` scripts, CI checks and admission policies.

```bash
cosign verify \
  --key https://raw.githubusercontent.com/LintenAI/linten/e82a3c646908ba0a6ee0beddc4310d7a6cac4065/cosign.pub \
  ghcr.io/lintenai/linten:v1.106.3
```

:::

### What's Changed

- Every certificate bundle the SDK, proxy and Docker images trust no longer includes the eMudhra root CA - [PR #47670](https://github.com/LintenAI/linten/pull/47670), [PR #47969](https://github.com/LintenAI/linten/pull/47969), [PR #48139](https://github.com/LintenAI/linten/pull/48139)
- Docker images and Helm charts are signed with the cosign key from commit `e82a3c6`. The previous key from commit `0112e53` no longer verifies them - [PR #48103](https://github.com/LintenAI/linten/pull/48103)

These changes and the version bump are backported in [PR #48078](https://github.com/LintenAI/linten/pull/48078) and [PR #48142](https://github.com/LintenAI/linten/pull/48142)

## Full Changelog

https://github.com/LintenAI/linten/compare/v1.106.2...v1.106.3
