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

## API workflow

1. `GET {base}` → returns `{ api, widgets, pages }`
2. `GET {base}/pages/{path}` → returns `{ page, cards }` with all card data
3. `PUT {base}/pages/{path}` with `{ cards: [{ id, data }] }` → updates cards

## Endpoints

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
Read a page with cards.
```json
{
  "page": { "name": "My Page", "path": "project/my-page" },
  "cards": [{ "id": "Notes", "type": "notes", "status": "done", "data": { "text": "..." } }]
}
```

### PUT `{base}/pages/{path}`
Update cards. Send only changed cards and fields.
```json
{ "cards": [{ "id": "Notes", "data": { "text": "New content" } }] }
```

## Tips
- Field names must match widget schema (check `widgets` from root endpoint)
- `type: "text"` = long markdown content, `type: "string"` = short value
- Card `status`: `"empty"` | `"processing"` | `"done"` | `"error"`
- Errors: 401 = bad token, 404 = page not found
