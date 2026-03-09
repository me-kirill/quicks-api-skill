---
name: quicks-api
description: >
  Interact with Quicks workspace via the external JSON API. Use when the user
  provides a quicks.ai URL (contains /api/x/), asks to read/write workspace
  pages or cards, or wants to give an LLM access to their workspace data.
allowed-tools: WebFetch, Bash
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

### Save token (create dir if needed)
```bash
mkdir -p ~/.quicks && cat > ~/.quicks/token.json << 'EOF'
{ "baseUrl": "<BASE_URL>" }
EOF
```

### Read token
```bash
cat ~/.quicks/token.json
```

## URL encoding

Paths may contain non-ASCII characters (Cyrillic, etc.). Always use the path exactly as returned by `GET {base}` (the pages list). Do NOT manually URL-encode path segments — `curl` and `WebFetch` handle encoding automatically.

## Generic endpoints (recommended)

Use these for all operations — they work reliably with all path types.

### GET `{base}`
Returns widget schemas and page list.
```json
{
  "widgets": {
    "notes": { "name": "Notes", "fields": { "text": { "type": "text", "editable": true } } }
  },
  "pages": [{ "name": "My Page", "path": "project/my-page" }]
}
```

### GET `{base}/pages/{path}`
Read a page with all cards.
```json
{
  "page": { "name": "My Page", "path": "project/my-page" },
  "cards": [{ "id": "Notes", "type": "notes", "status": "done", "data": { "text": "..." } }]
}
```

### PUT `{base}/pages/{path}`
Update cards. Send only changed cards and fields. **Primary way to update notes.**
```json
{ "cards": [{ "id": "Notes", "data": { "text": "# Updated content" } }] }
```

### POST `{base}/pages/{path}/cards`
Create a card of any type.
```json
{ "type": "notes", "name": "My Notes", "data": { "text": "# Hello" } }
```
Response: `{ "id": "My_Notes" }` (201)

### POST `{base}/pages`
Create a page.
```json
{ "parentPath": "project", "slug": "new-page", "name": "New Page" }
```
Response: `{ "path": "project/new-page" }`

## Notes shortcut endpoints

Convenience endpoints for notes cards. Text is stored as-is (markdown when sent via API, may be TipTap HTML for notes created in the web UI).

### POST `{base}/pages/{path}/notes`
Create a notes card.
```json
{ "name": "My Notes", "text": "# Hello\n\nMarkdown content." }
```
Response: `{ "id": "My_Notes" }` (201)

### GET `{base}/pages/{path}/notes/{cardId}`
Read a notes card.
```json
{ "id": "My_Notes", "name": "My Notes", "text": "# Hello\n\nMarkdown content." }
```

### PUT `{base}/pages/{path}/notes/{cardId}`
Update a notes card.
```json
{ "text": "# Updated\n\nNew content." }
```
Response: `{ "ok": true }`

## JSON validation (bun)

```bash
echo '{"text":"# Hello"}' | bun run validate.ts create-note
echo '{"cards":[{"id":"Notes","data":{"text":"..."}}]}' | bun run validate.ts update-cards
echo '{"type":"notes","data":{"text":"# Hello"}}' | bun run validate.ts create-card
echo '{"slug":"new","name":"New"}' | bun run validate.ts create-page
```

## Tips
- `type: "text"` = long markdown content, `type: "string"` = short value
- Card `status`: `"empty"` | `"processing"` | `"done"` | `"error"`
- Errors: 401 = bad token, 404 = page not found, 400 = validation error
- Before adding content, read the page first to check for duplicates
- Prefer `PUT /pages/{path}` over notes endpoints — it works with all card types and paths
