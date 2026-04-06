# Orbinex

> Your tools. Your AI. Any website.

---

## Quick start (5 minutes)

### Step 1 — Install
```bash
npm install
```

### Step 2 — Set up env files
```bash
cp packages/engine/.env.example     packages/engine/.env
cp packages/mcp-server/.env.example packages/mcp-server/.env
```

### Step 3 — Choose your LLM (edit `packages/engine/.env`)

**FREE option — Ollama (recommended for dev):**
```bash
# Install Ollama from https://ollama.com, then:
ollama pull llama3
ollama serve   # keep this running in a separate terminal
```
The `.env` already defaults to Ollama — no changes needed.

**Paid option — switch in 2 lines:**
```env
LLM_PROVIDER=anthropic
LLM_MODEL=claude-sonnet-4-20250514
LLM_API_KEY=sk-ant-your-key-here
```

### Step 4 — Start everything
```bash
npm run dev
```

### Step 5 — Open the chat UI
Go to **http://localhost:5173** — click the purple bubble in the bottom-right corner.

---

## Testing each tool

| What to ask | Tool used | Requires |
|---|---|---|
| "What is the weather in Mumbai?" | Weather | Nothing (free) |
| "Tell me about Tokyo" | City Tour | Nothing (free) |
| "What is the capital of France?" | Country Info | Nothing (free) |
| "Convert 100 USD to INR" | Currency | Nothing (free) |
| "Show me experience data" | Experience API | Your server at localhost:5017 |
| "What is Orbinex?" | RAG docs | Ollama running |

---

## Configuring the Experience API tool

Edit `packages/mcp-server/.env`:
```env
EXPERIENCE_API_URL=http://localhost:5017/Experience
# Optional: add a Bearer token if your API requires auth
EXPERIENCE_API_KEY=your-token-here
```

The tool shapes the raw API response automatically. If your API returns
different field names (e.g. `jobTitle` instead of `title`), edit the
`shapeItem()` function in `packages/mcp-server/src/tools/experience.ts`.

---

## Adding a new tool (3 steps)

### 1. Create `packages/mcp-server/src/tools/myTool.ts`
```typescript
import type { OrbinexTool } from '../lib/types'

export const myTool: OrbinexTool = {
  name: 'do_something',
  description: 'What this tool does — the AI reads this to decide when to call it.',
  parameters: {
    input: {
      type: 'string',
      description: 'The input value',
      required: true,
    },
  },
  handler: async ({ input }) => {
    // Your logic here — call a DB, API, file, anything
    return { result: `You said: ${input}` }
  },
}
```

### 2. Add to config (optional — for enable/disable toggle)
In `packages/mcp-server/src/config/index.ts`, add:
```typescript
myFeature: { enabled: process.env.MY_FEATURE_ENABLED !== 'false' }
```

### 3. Register in `packages/mcp-server/src/index.ts`
```typescript
import { myTool } from './tools/myTool'
// Inside the tools array:
...(config.myFeature.enabled ? [myTool] : []),
```

---

## Embed on any website

```html
<script
  src="https://cdn.yourdomain.com/orbinex.js"
  data-tenant="YOUR_TENANT_ID"
  data-engine="https://engine.yourdomain.com"
  data-mode="bubble"
  data-color="#6C5CE7"
  data-title="Support Chat"
  data-welcome="Hi! How can I help you today?"
></script>
```

| Attribute | Options | Default |
|---|---|---|
| `data-tenant` | your ID (required) | — |
| `data-engine` | your engine URL | localhost:3001 |
| `data-mode` | `bubble` `panel` `fullpage` | `bubble` |
| `data-color` | any hex color | `#6C5CE7` |
| `data-title` | chat header text | AI Assistant |
| `data-welcome` | first message | — |
| `data-placeholder` | input hint | Type a message… |
| `data-position` | `bottom-right` `bottom-left` | `bottom-right` |

---

## Architecture

```
http://localhost:5173  ← Plugin test page (Vite dev server)
        │
        │ SSE stream
        ▼
http://localhost:3001  ← Orbinex Engine (Fastify)
  ├── Agent loop: LLM decides → calls tools → re-prompts → returns answer
  ├── Model router: Ollama / Claude / GPT / Gemini (set in engine .env)
  └── Calls MCP server for tool results
        │ HTTP
        ▼
http://localhost:3002  ← @orbinex/mcp-server (Fastify)
  ├── get_weather          → open-meteo.com (free)
  ├── get_city_tour        → Wikipedia + open-meteo geocoding (free)
  ├── get_country_info     → restcountries.com (free)
  ├── get_currency_rate    → open.er-api.com (free)
  ├── get_experience       → YOUR API at localhost:5017/Experience
  ├── search_documents     → RAG with Ollama embeddings (free)
  └── rebuild_document_index
```

## Tools at a glance

| Tool name | Description | Free? |
|---|---|---|
| `get_weather` | Weather for any city | ✅ always |
| `get_city_tour` | City guide, Wikipedia, coordinates | ✅ always |
| `get_country_info` | Capital, population, currency, flag | ✅ always |
| `get_currency_rate` | Live exchange rates | ✅ always |
| `get_experience` | Your API — professional experience | configured |
| `search_documents` | RAG over your docs | ✅ with Ollama |
| `rebuild_document_index` | Rebuild the RAG index | ✅ with Ollama |
# orbinex
