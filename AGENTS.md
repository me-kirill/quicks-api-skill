# Quicks Workspace API Skill

Interact with Quicks workspace via the external JSON API.

## Token resolution

On every invocation, resolve the base URL in this order:

1. **User provided a URL** (contains `/api/x/`) → extract base URL, save to `~/.quicks/token.json`
2. **File `~/.quicks/token.json` exists** → read and use `baseUrl` from it
3. **Neither** → ask the user for their Quicks API URL

Token file format (`~/.quicks/token.json`):
```json
{ "baseUrl": "https://api-3.quicks.ai/api/x/abc123-..." }
```

Save: `mkdir -p ~/.quicks && echo '{ "baseUrl": "<URL>" }' > ~/.quicks/token.json`

## API

Auth token is embedded in the URL — no headers needed.

- `GET {base}` → `{ widgets, pages }` — list all pages and widget schemas
- `GET {base}/pages/{path}` → `{ page, cards }` — read page with all cards
- `PUT {base}/pages/{path}` with `{ cards: [{ id, data }] }` — update cards

## Field types
- `type: "text"` = long markdown content
- `type: "string"` = short value

## Card status
`"empty"` | `"processing"` | `"done"` | `"error"`

## Errors
- 401 = bad token
- 404 = page not found
