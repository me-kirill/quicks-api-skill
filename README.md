# Quicks API Skill

Give LLM coding agents (Claude Code, Codex, Cursor) read & write access to your [Quicks](https://quicks.ai) workspace.

## Install

### Claude Code

Download `quicks-api.skill` from your [account page](https://app.quicks.ai/account) and open it, or:

```bash
claude install-skill /path/to/quicks-api.skill
```

### Codex

```bash
$skill-installer
# Point to this repository
```

Or manually:

```bash
git clone https://github.com/anthropics/quicks-api-skill.git
cp -R quicks-api-skill ~/.agents/skills/quicks-api
```

### Any LLM agent

Copy your API URL from [account settings](https://app.quicks.ai/account) and paste it into your agent. The URL is self-documenting — `GET` it to see all endpoints, schemas, and pages.

## Setup

1. Go to your Quicks account page and generate an API key
2. The skill auto-saves the token to `~/.quicks/token.json` on first use
3. No manual configuration needed after that

## What it does

- List all pages in your workspace
- Read any page with all its cards and data
- Update card content (notes, text fields, etc.)
