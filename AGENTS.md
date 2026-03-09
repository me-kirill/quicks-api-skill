# Quicks Workspace API Skill

Interact with Quicks workspace via the external JSON API.

## Token resolution

On every invocation, resolve the base URL in this order:

1. **User provided a URL** (contains `/api/x/`) → extract base URL, save to `~/.quicks/token.json`
2. **File `~/.quicks/token.json` exists** → read and use `baseUrl` from it
3. **Neither** → ask the user to get their API URL at https://3.quicks.ai/account

Token file format (`~/.quicks/token.json`):
```json
{ "baseUrl": "https://api-3.quicks.ai/api/x/abc123-..." }
```

Save: `mkdir -p ~/.quicks && echo '{ "baseUrl": "<URL>" }' > ~/.quicks/token.json`

## Generic API (recommended)

For all card types. Use paths exactly as returned by the list endpoint.

- `GET {base}` → `{ widgets, pages }` — list pages and widget schemas
- `GET {base}/pages/{path}` → `{ page, cards }` — read page with all cards
- `PUT {base}/pages/{path}` with `{ cards: [{ id, data }] }` — **update cards (preferred)**
- `POST {base}/pages/{path}/cards` with `{ type, name?, data? }` — create a card (returns `{ id }`)
- `POST {base}/pages` with `{ parentPath?, slug, name }` — create a page

## Notes shortcut API

Convenience endpoints for notes cards. Text stored as-is (markdown via API, may be TipTap HTML from web UI).

- `POST {base}/pages/{path}/notes` with `{ name?, text }` — create notes card (201, returns `{ id }`)
- `GET {base}/pages/{path}/notes/{cardId}` — read notes card (returns `{ id, name, text }`)
- `PUT {base}/pages/{path}/notes/{cardId}` with `{ text }` — update notes card

## JSON validation (bun)

```bash
echo '{"text":"# Hello"}' | bun run validate.ts create-note
echo '{"cards":[{"id":"Notes","data":{"text":"..."}}]}' | bun run validate.ts update-cards
```

## Field types
- `type: "text"` = long markdown content
- `type: "string"` = short value

## Tips
- Prefer `PUT /pages/{path}` over notes endpoints for reliability
- Read page before adding content to avoid duplicates
- Errors: 401 = bad token, 404 = page/card not found, 400 = validation error
