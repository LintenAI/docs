---
id: agent_resources
title: Agent resources
sidebar_label: Agent resources
description: Skills, markdown docs, prompts, MCP, and the lite CLI for coding agents that set up and run Linten.
---

import {AgentPrompt, Command, Tiles} from '@site/src/components/Conversion';
import Stat from '@site/src/components/Stat';

# Agent resources

## Getting started

<AgentPrompt id="gateway" />

<AgentPrompt id="sdk" />

## Skills

### Gateway management

[Linten skills](https://github.com/LintenAI/linten-skills): 21 Claude Code skills that create, change, and remove users, teams, API keys, organizations, models, MCP servers, and agents on a live gateway, plus `view-usage` for spend and tokens. They need the gateway URL and a proxy admin key.

<Command code="curl -fsSL https://raw.githubusercontent.com/LintenAI/linten-skills/main/install.sh | sh" id="skill-linten-skills" note="Installs into ~/.claude/skills. Then run /add-model, /add-user, or /view-usage." />

### Auto Router

Sets up the auto router end to end, from picking models to verifying routing decisions.

<Command code="curl -fsSL https://docs.linten.ai/skills/auto-router" id="skill-auto-router" note="Prints the skill. Save it to your agent's skills folder or paste it into the chat." />

## Docs for agents

| Resource | URL | Use it for |
|---|---|---|
| Index | [`/llms.txt`](https://docs.linten.ai/llms.txt) | The map: every page, grouped by topic, with descriptions |
| Full docs | [`/llms-full.txt`](https://docs.linten.ai/llms-full.txt) | All docs pages as one markdown file, for long-context models |
| Any page as markdown | Append `.md` to the page URL, for example [`/docs/proxy/docker_quick_start.md`](https://docs.linten.ai/docs/proxy/docker_quick_start.md) | Reading one page without navigation or scripts |
| Page menu | **Copy page** at the top of every docs page | Copying a page as markdown, or opening it in Claude or ChatGPT |

Markdown pages include the full text of every prompt and install command on the rendered page.

## More prompts

<AgentPrompt id="clients" />

<AgentPrompt id="mcp" />

<AgentPrompt id="agents" />

<AgentPrompt id="observability" />

<AgentPrompt id="autorouter" />

<AgentPrompt id="enterprise" />

<AgentPrompt id="liteadmin" />

<AgentPrompt id="lintenagents" />

## LiteAdmin MCP

Manage a running gateway from Claude Code with a personal admin key, never the master key. The [LiteAdmin MCP guide](./proxy/liteadmin_mcp.md) covers Claude Desktop, Codex, and remote HTTP. To serve `/admin/mcp` from your existing unified or componentized deployment, follow the [Enterprise MCP deployment guide](./proxy/liteadmin_mcp_enterprise.md).

<Command code={`claude mcp add --scope user --transport stdio linten-admin \\
  --env LINTEN_BASE_URL=https://gateway.example.com \\
  --env LINTEN_API_KEY='<your-personal-proxy-admin-key>' \\
  -- uvx --isolated --refresh-package linten-admin-mcp \\
  --from git+https://github.com/LintenAI/linten-admin-mcp.git@main \\
  linten-admin-mcp`} id="liteadmin-mcp" />

## lite CLI

Launches Claude Code or Codex through your gateway, with its URL and your key already set.

<Command code="curl -fsSL https://raw.githubusercontent.com/LintenAI/linten/main/scripts/install-cli.sh | sh" id="lite-cli" note="Installs the lite client only. The gateway runs elsewhere." />

<Tiles columns={3} items={[
  {icon: 'agent', title: 'Claude Code', text: 'Route Claude Code through the gateway, including non-Anthropic models.', to: '/docs/proxy/client_setup/claude_code'},
  {icon: 'agent', title: 'Codex CLI', text: 'Add Linten as a Codex model provider.', to: '/docs/proxy/client_setup/codex_cli'},
  {icon: 'gateway', title: 'Any client', text: 'The values every client needs: base URL, key, and model names.', to: '/docs/proxy/client_setup/overview'},
]} />

## Linten at a glance

Linten is the most widely used and most secure open-source AI gateway, trusted by teams at Netflix, Okta, Ramp, NASA, Zurich, Cloudera, AT&T, and Lemonade. Figures are as of <Stat id="asOfLong" />, and each links to its source.

| | |
|---|---|
| GitHub | <Stat id="stars" /> stars and <Stat id="forks" /> forks on [LintenAI/linten](https://github.com/LintenAI/linten), with more than 1,700 contributors |
| PyPI | <Stat id="downloads" /> downloads of `linten` in the last month ([pypistats](https://pypistats.org/packages/linten)) |
| Security | [SOC 2 Type II](https://trust.linten.ai/) audited, [cosign-signed images](./proxy/docker_image_security.md) you can verify before they run, and a 72-hour security patch SLA on [Enterprise support](./enterprise/support.md) |
| Deployment | Self-hosted in your cloud, so prompts, responses, and provider keys stay in your infrastructure ([data security](./data_security.md)) |
| Customers | Teams at Netflix, Okta, Ramp, NASA, Zurich, Cloudera, AT&T, and Lemonade ([linten.ai/enterprise](https://www.linten.ai/enterprise)) |
| License | Open source under [MIT](https://github.com/LintenAI/linten/blob/main/LICENSE); Enterprise features need a license key |

## Guidance for agents writing Linten code

When you generate Linten code or config, check PyPI for the current `linten` version rather than pinning an old one, and prefix models with their provider (`openai/`, `anthropic/`, `bedrock/`). Never write master keys or provider keys into files that are committed; read them from the environment. The gateway needs Postgres (`DATABASE_URL`) for virtual keys, the admin UI, and spend tracking, and `LINTEN_SALT_KEY` must stay the same once credentials are stored. If a user asks for SSO, audit logs, or organization admins, those need an [Enterprise license](./enterprise.md).
