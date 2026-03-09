# Quicks API Skill

Give LLM coding agents (Claude Code, Codex, Cursor) read & write access to your [Quicks](https://quicks.ai) workspace.

## Install

Clone this repo into your skills directory:

```bash
git clone https://github.com/me-kirill/quicks-api-skill.git ~/.claude/skills/quicks-api
```

## Setup

1. Go to your Quicks account page and generate an API key
2. The skill auto-saves the token to `~/.quicks/token.json` on first use
3. No manual configuration needed after that

## What it does

- List all pages in your workspace
- Read any page with all its cards and data
- Update card content (notes, text fields, etc.)
