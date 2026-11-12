---
title: "Linten v1.104.5 counts Claude tokens on Bedrock Mantle when Bedrock Runtime cannot"
description: "Token counts for newer Claude models on Bedrock come from the Bedrock Mantle endpoint instead of a local estimate that undercounts."
slug: "v1-104-5"
date: 2026-10-21T05:47:40
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
docker.linten.ai/lintenai/linten:1.104.5
```

</TabItem>
<TabItem value="pip" label="Pip">

```bash
pip install linten==1.104.5
```

</TabItem>
</Tabs>

This release is published as [`ghcr.io/lintenai/linten:v1.104.5`](https://github.com/LintenAI/linten/pkgs/container/linten). See the [GitHub release](https://github.com/LintenAI/linten/releases/tag/v1.104.5) and the full [releases page](https://github.com/LintenAI/linten/releases)

`v1.104.5` is a patch release on top of [`v1.104.4`](/release_notes/v1.104.4/v1-104-4). It backports the Bedrock Mantle fallback for token counting onto `stable/1.104.x`. There are no new database migrations. The `v1.104.5` tag points at [`5275320`](https://github.com/LintenAI/linten/commit/5275320b6101fed58dd2294fb2fe93a7d39d599a)

### What's Changed

- Bedrock Runtime CountTokens rejects newer Claude models, so `/v1/messages/count_tokens` fell back to a local estimate that undercounts. On a 400 or 404 for a Claude model the count now comes from the Bedrock Mantle Anthropic endpoint, and only falls back to the local estimate if Mantle also fails. Non-Claude models never call Mantle - [PR #45317](https://github.com/LintenAI/linten/pull/45317), [PR #46430](https://github.com/LintenAI/linten/pull/46430)

The fix and the version bump are backported in [PR #47634](https://github.com/LintenAI/linten/pull/47634)

## Full Changelog

https://github.com/LintenAI/linten/compare/v1.104.4...v1.104.5
