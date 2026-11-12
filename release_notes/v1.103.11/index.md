---
title: "Linten v1.104.9 and v1.103.11 speed up request lookups in the Logs view"
description: "Builds the spend log indexes that some installs lack after migrations, so Logs view lookups stay fast, and improves startup when replicas boot together."
slug: "v1-103-11"
date: 2026-11-10T20:24:40
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
docker.linten.ai/lintenai/linten:1.103.11
```

</TabItem>
<TabItem value="pip" label="Pip">

```bash
pip install linten==1.103.11
```

</TabItem>
</Tabs>

This release is published as [`ghcr.io/lintenai/linten:v1.103.11`](https://github.com/LintenAI/linten/pkgs/container/linten). See the [GitHub release](https://github.com/LintenAI/linten/releases/tag/v1.103.11) and the full [releases page](https://github.com/LintenAI/linten/releases).

`v1.103.11` is a patch release on top of [`v1.103.10`](/release_notes/v1.103.10/v1-103-10). There are no new database migrations. The two `Linten_SpendLogs` index migrations stay no-ops, and the indexes are now built after migrations run. The migration job builds them, and a proxy that runs its own migrations builds them in the background once it serves. The `v1.103.11` tag points at [`6061a83`](https://github.com/LintenAI/linten/commit/6061a83a2774e1f22f9b4cbdcff8058b328084aa).

### What's Changed

- **Logging and observability:** Improved request lookups in the Logs view on large spend log tables by building any missing indexes after migrations - [PR #43948](https://github.com/LintenAI/linten/pull/43948), [PR #44109](https://github.com/LintenAI/linten/pull/44109), [PR #44203](https://github.com/LintenAI/linten/pull/44203), [PR #46131](https://github.com/LintenAI/linten/pull/46131)
- **Deployment:** Improved startup reliability when several replicas boot against one database at the same time - [PR #40932](https://github.com/LintenAI/linten/pull/40932), [PR #44283](https://github.com/LintenAI/linten/pull/44283)

The changes are backported in [PR #50856](https://github.com/LintenAI/linten/pull/50856), and the version bump is in [PR #50984](https://github.com/LintenAI/linten/pull/50984).

## Full Changelog

https://github.com/LintenAI/linten/compare/v1.103.10...v1.103.11
