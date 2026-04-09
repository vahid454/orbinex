// ─── Core message types ───────────────────────────────────────

export type Role = 'user' | 'assistant' | 'system'

export interface Message {
  id: string
  role: Role
  content: string
  createdAt: string
}

export interface Session {
  id: string
  tenantId: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

// ─── Tenant / config types ────────────────────────────────────

export type ModelProvider = 'anthropic' | 'openai' | 'google' | 'ollama'

export interface ModelConfig {
  provider: ModelProvider
  model: string           // e.g. 'claude-sonnet-4-20250514', 'gpt-4o', 'gemini-pro'
  apiKey?: string         // encrypted at rest; optional for Ollama
  baseUrl?: string        // used for Ollama or custom endpoints
  maxTokens?: number
  temperature?: number
}

export interface TenantConfig {
  tenantId: string
  mcpServerUrl: string    // where the customer's MCP server is running
  mcpApiKey?: string      // optional auth for the MCP server
  model: ModelConfig
  widgetConfig: WidgetConfig
}

// ─── Plugin / widget config ───────────────────────────────────

export type WidgetMode = 'bubble' | 'panel' | 'fullpage'

export interface WidgetConfig {
  mode: WidgetMode
  theme?: {
    primaryColor?: string
    fontFamily?: string
    borderRadius?: string
  }
  placeholder?: string
  welcomeMessage?: string
  position?: 'bottom-right' | 'bottom-left'
}

// ─── MCP types ────────────────────────────────────────────────

export interface ToolDefinition {
  name: string
  description: string
  parameters: Record<string, ToolParameter>
}

export interface ToolParameter {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  description?: string
  required?: boolean
}

export interface ToolCallRequest {
  toolName: string
  parameters: Record<string, unknown>
}

export interface ToolCallResult {
  toolName: string
  result: unknown
  error?: string
}

// ─── API types ────────────────────────────────────────────────

export interface ChatRequest {
  sessionId?: string
  message: string
  tenantId: string
}

export interface ChatResponse {
  sessionId: string
  message: Message
}

export interface StreamChunk {
  type: 'text' | 'tool_call' | 'tool_result' | 'done' | 'error'
  content: string
  sessionId: string
}

export interface StreamChunk {
  type: 'text' | 'tool_call' | 'tool_result' | 'done' | 'error'
  content: string
  sessionId: string
  metadata?: {
    userMessage?: Message
  }
  toolCall?: {
    name: string
    arguments: Record<string, unknown>
  }
  toolResult?: {
    name: string
    result: unknown
  }
}