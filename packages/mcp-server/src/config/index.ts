// ═══════════════════════════════════════════════════════════
//  Orbinex MCP Server — central config
//  Edit this file or the .env to enable/disable tools and set API keys.
// ═══════════════════════════════════════════════════════════

export interface McpConfig {
  port:    number
  apiKey?: string

  // ── Weather tool ─────────────────────────────────────────
  weather: {
    enabled:     boolean
    apiKey?:     string     // openweathermap.org — free tier, optional
    units:       'metric' | 'imperial'
    defaultCity: string
  }

  // ── RAG tool ─────────────────────────────────────────────
  rag: {
    enabled:         boolean
    docsPath:        string
    embeddingModel:  string   // ollama model for embeddings
    generationModel: string   // ollama model for answers
    ollamaBaseUrl:   string
    topK:            number
    indexPath:       string
  }

  // ── City Tour tool ────────────────────────────────────────
  cityTour: { enabled: boolean }

  // ── Country Capital tool ──────────────────────────────────
  countryCapital: { enabled: boolean }

  // ── Currency tool ─────────────────────────────────────────
  currency: { enabled: boolean }

  // ── Experience API tool (your real API) ───────────────────
  experienceApi: {
    enabled: boolean
    // The base URL of your experience API endpoint
    // e.g. http://localhost:5017/Experience
    url?:    string
    apiKey?: string     // optional Bearer token if your API requires auth
  }
}

const config: McpConfig = {
  port:   Number(process.env.PORT     ?? 3002),
  apiKey: process.env.MCP_API_KEY     ?? undefined,

  weather: {
    enabled:     process.env.WEATHER_ENABLED !== 'false',
    apiKey:      process.env.OPENWEATHER_API_KEY ?? undefined,
    units:      (process.env.WEATHER_UNITS as 'metric' | 'imperial') ?? 'metric',
    defaultCity: process.env.WEATHER_DEFAULT_CITY ?? 'Mumbai',
  },

  rag: {
    enabled:         process.env.RAG_ENABLED !== 'false',
    docsPath:        process.env.RAG_DOCS_PATH        ?? './data/docs',
    embeddingModel:  process.env.RAG_EMBEDDING_MODEL  ?? 'nomic-embed-text',
    generationModel: process.env.RAG_GENERATION_MODEL ?? 'llama3',
    ollamaBaseUrl:   process.env.OLLAMA_BASE_URL      ?? 'http://localhost:11434',
    topK:           Number(process.env.RAG_TOP_K       ?? 4),
    indexPath:       process.env.RAG_INDEX_PATH        ?? './data/rag-index.json',
  },

  cityTour:       { enabled: process.env.CITY_TOUR_ENABLED    !== 'false' },
  countryCapital: { enabled: process.env.COUNTRY_INFO_ENABLED !== 'false' },
  currency:       { enabled: process.env.CURRENCY_ENABLED     !== 'false' },

  experienceApi: {
    enabled: process.env.EXPERIENCE_API_ENABLED !== 'false',
    // ↓ Change this URL to your real endpoint
    url:     process.env.EXPERIENCE_API_URL ?? 'http://localhost:5017/Experience',
    apiKey:  process.env.EXPERIENCE_API_KEY ?? undefined,
  },
}

export default config
