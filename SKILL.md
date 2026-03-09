---
name: quicks-api
description: >
  Interact with Quicks workspace via the external JSON API. Use when the user
  provides a quicks.ai URL (contains /api/x/), asks to read/write workspace
  pages or cards, or wants to give an LLM access to their workspace data.
allowed-tools: WebFetch
---

# Quicks Workspace API

JSON API for reading and writing pages with cards. Auth token is embedded in the URL — no headers needed.

## Token resolution

On every invocation, resolve the base URL in this order:

1. **User provided a URL** (contains `/api/x/`) → extract base URL, save to `~/.quicks/token.json`
2. **File `~/.quicks/token.json` exists** → read and use `baseUrl` from it
3. **Neither** → ask the user to get their API URL at https://3.quicks.ai/account

### Token file format (`~/.quicks/token.json`)
```json
{ "baseUrl": "https://api-3.quicks.ai/api/x/abc123-..." }
```

## Endpoints

All endpoints use `{base}` = the `baseUrl` from token. Paths may contain non-ASCII (Cyrillic). Use paths exactly as returned by `GET {base}`.

### Pages

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `{base}` | — | `{ widgets, pages }` — list all pages and schemas |
| GET | `{base}/pages/{path}` | — | `{ page, cards }` — read page with all cards |
| PUT | `{base}/pages/{path}` | `{ cards: [{ id, data }] }` | `{ ok }` — update cards |
| POST | `{base}/pages` | `{ parentPath?, slug, name }` | `{ path }` — create page |

### Cards

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `{base}/pages/{path}/cards` | `{ type, name?, data? }` | `{ id }` (201) — create card |
| DELETE | `{base}/pages/{path}/cards/{cardId}` | — | `{ ok }` — delete card |

### Notes (markdown shortcuts)

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `{base}/pages/{path}/notes` | `{ name?, text }` | `{ id }` (201) — create notes card |
| GET | `{base}/pages/{path}/notes/{cardId}` | — | `{ id, name, text }` — read notes |
| PUT | `{base}/pages/{path}/notes/{cardId}` | `{ text }` | `{ ok }` — update notes |

## Tips
- `type: "text"` = long markdown content, `type: "string"` = short value
- Card `status` is read-only: `"empty"` | `"processing"` | `"done"` | `"error"`
- Errors: 401 = bad token, 404 = page/card not found, 400 = validation error
- Before adding content, read the page first to check for duplicates
