---
title: "Linten v1.108.3 (LTS) fixes Bedrock api_base and large MCP tool results"
description: "Fixes Bedrock deployments with an empty api_base, MCP tool results over 1 MiB, and model-level post_call guardrails that ran twice."
slug: "v1-108-3"
date: 2026-11-07T22:29:58
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

:::tip

`v1.108.3` is a patch release on the 1.108 LTS line. The `lts` image tag always points to the latest LTS release, so pull `docker.linten.ai/lintenai/linten:lts` to stay on the newest LTS patch. See the [LTS pilot](/docs/enterprise/lts_pilot).

:::

## Deploy this version

<Tabs>
<TabItem value="docker" label="Docker">

```bash
docker run \
-e LINTEN_MASTER_KEY=sk-<paste-a-long-random-key> \
-e DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<dbname> \
-e STORE_MODEL_IN_DB=True \
-p 4000:4000 \
docker.linten.ai/lintenai/linten:1.108.3
```

</TabItem>
<TabItem value="pip" label="Pip">

```bash
pip install linten==1.108.3
```

</TabItem>
</Tabs>

This release is published as [`ghcr.io/lintenai/linten:v1.108.3`](https://github.com/LintenAI/linten/pkgs/container/linten). See the [GitHub release](https://github.com/LintenAI/linten/releases/tag/v1.108.3) and the full [releases page](https://github.com/LintenAI/linten/releases).

`v1.108.3` is a patch release on top of [`v1.108.2`](/release_notes/v1.108.2/v1-108-2). There are no new database migrations. The `v1.108.3` tag points at [`b7d579f`](https://github.com/LintenAI/linten/commit/b7d579fab2818968322ef96e5b8e98dc8178fafc).

### What's Changed

- **AWS Bedrock:** Fixed every request failing on a Bedrock deployment with `api_base: ""`, which answered 500 or 400 - [PR #50449](https://github.com/LintenAI/linten/pull/50449)
- **MCP:** Fixed tool results over 1 MiB failing with `SSE stream ended without a response`, broken since v1.103.0 - [PR #47034](https://github.com/LintenAI/linten/pull/47034)
- **Guardrails:** Fixed model-level `post_call` guardrails checking each response twice and calling the moderation provider twice - [PR #50463](https://github.com/LintenAI/linten/pull/50463)

## Full Changelog

https://github.com/LintenAI/linten/compare/v1.108.2...v1.108.3
