import { SYSTEM_PROMPT } from '../prompts/system'

// ═══════════════════════════════════════════════════════════
//  Orbinex Engine — central config
//  Edit this file to change LLM provider, model, and limits.
// ═══════════════════════════════════════════════════════════

export interface OrbinexConfig {
  // ── LLM provider ─────────────────────────────────────────
  // Options: 'anthropic' | 'openai' | 'google' | 'ollama'
  provider: 'anthropic' | 'openai' | 'google' | 'ollama'

  // Model name for the chosen provider:
  //   anthropic → 'claude-sonnet-4-20250514' | 'claude-haiku-4-5-20251001'
  //   openai    → 'gpt-4o' | 'gpt-4o-mini'
  //   google    → 'gemini-1.5-pro' | 'gemini-1.5-flash'
  //   ollama    → 'qwen2.5' (best) | 'llama3.1' | 'llama3.2' | 'mistral-nemo'
  //              Uses Ollama native API — reliable tool calling
  model: string

  // API key — leave blank for Ollama (runs locally, no key needed)
  apiKey?: string

  // Base URL — only needed for Ollama or custom OpenAI-compat endpoints
  // Default for Ollama: http://localhost:11434/v1
  baseUrl?: string

  // ── Generation params ─────────────────────────────────────
  maxTokens: number    // max tokens in LLM response
  temperature: number  // 0 = deterministic, 1 = creative

  // ── Session ───────────────────────────────────────────────
  maxHistoryMessages: number  // how many past messages to keep in context

  // ── System prompt ─────────────────────────────────────────
  // This is sent as the system message to every conversation.
  systemPrompt: string
  promptCaching: boolean   // Anthropic only: cache system prompt
}

const config: OrbinexConfig = {
  // ── CHANGE THIS to switch provider ───────────────────────
  provider:    (process.env.LLM_PROVIDER as OrbinexConfig['provider']) ?? 'ollama',
  model:        process.env.LLM_MODEL    ?? 'qwen2.5',
  apiKey:       process.env.LLM_API_KEY  ?? undefined,
  baseUrl:      process.env.LLM_BASE_URL ?? 'http://localhost:11434',

  // ── Generation params ─────────────────────────────────────
  maxTokens:   Number(process.env.LLM_MAX_TOKENS   ?? 1024),
  temperature: Number(process.env.LLM_TEMPERATURE  ?? 0.7),

  // ── Session ───────────────────────────────────────────────
  maxHistoryMessages: Number(process.env.MAX_HISTORY ?? 20),

  // ── System prompt ─────────────────────────────────────────
  systemPrompt:   process.env.SYSTEM_PROMPT ?? SYSTEM_PROMPT,
  promptCaching:  process.env.PROMPT_CACHING !== 'false',
}

export default config