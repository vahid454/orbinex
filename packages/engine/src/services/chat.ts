import type { ChatRequest, ChatResponse, StreamChunk, Message } from '@orbinex/shared'
import { ModelService } from './model'
import { McpService }   from './mcp'
import config from '../config'

const modelService = new ModelService()
const mcpService   = new McpService()

// Simple in-memory session store (replace with Redis/Postgres in production)
const sessions = new Map<string, Message[]>()

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function getSession(sessionId: string): Message[] {
  return sessions.get(sessionId) ?? []
}

function saveSession(sessionId: string, messages: Message[]) {
  // Trim to max history to avoid unbounded growth
  const trimmed = messages.slice(-config.maxHistoryMessages)
  sessions.set(sessionId, trimmed)
}

// ── Fetch available tools from MCP server ────────────────────
async function getToolSchemas() {
  const mcpUrl = process.env.MCP_SERVER_URL ?? 'http://localhost:3002'
  const apiKey = process.env.MCP_API_KEY
  try {
    return await mcpService.listTools(mcpUrl, apiKey)
  } catch {
    console.warn('[ChatService] Could not reach MCP server — running without tools')
    return []
  }
}

// ── Build OpenAI-style tool definitions for the LLM ─────────
function buildToolDefs(tools: Awaited<ReturnType<typeof getToolSchemas>>) {
  return tools.map(tool => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: 'object',
        properties: Object.fromEntries(
          Object.entries(tool.parameters).map(([k, v]) => [k, {
            type: v.type,
            description: v.description ?? k,
          }])
        ),
        required: Object.entries(tool.parameters)
          .filter(([, v]) => v.required)
          .map(([k]) => k),
      },
    },
  }))
}

// ── Main chat function ───────────────────────────────────────
export class ChatService {
  async chat(req: ChatRequest): Promise<ChatResponse> {
    const sessionId = req.sessionId ?? makeId()
    const history   = getSession(sessionId)
    const tools     = await getToolSchemas()

    // Add user message
    const userMsg: Message = {
      id: makeId(), role: 'user',
      content: req.message, createdAt: new Date().toISOString(),
    }
    const messages = [...history, userMsg]

    // ── Agentic loop: LLM → tool calls → LLM → ... ──────────
    let finalContent = ''
    let loopMessages = [
      { role: 'system' as const, content: config.systemPrompt },
      ...messages.map(m => ({ role: m.role as any, content: m.content })),
    ]

    for (let i = 0; i < 5; i++) {   // max 5 tool-call rounds
      const result = await modelService.completeWithTools(
        config, loopMessages, buildToolDefs(tools)
      )

      if (result.type === 'text') {
        finalContent = result.content
        break
      }

      if (result.type === 'tool_calls') {
        // Execute each tool call against MCP server
        const mcpUrl = process.env.MCP_SERVER_URL ?? 'http://localhost:3002'
        const apiKey = process.env.MCP_API_KEY

        // Add assistant message with tool_calls
        loopMessages.push({ role: 'assistant', content: result.rawMessage } as any)

        for (const call of result.toolCalls) {
          console.log(`[ChatService] Calling tool: ${call.name}(${JSON.stringify(call.arguments)})`)
          try {
            const toolResult = await mcpService.call(mcpUrl, {
              toolName:   call.name,
              parameters: call.arguments,
            }, apiKey)
            loopMessages.push({
              role: 'tool',
              tool_call_id: call.id,
              content: JSON.stringify(toolResult.result),
            } as any)
          } catch (err: any) {
            loopMessages.push({
              role: 'tool',
              tool_call_id: call.id,
              content: `Error: ${err.message}`,
            } as any)
          }
        }
        // Loop back to LLM with tool results
        continue
      }

      break
    }

    // Save conversation
    const assistantMsg: Message = {
      id: makeId(), role: 'assistant',
      content: finalContent, createdAt: new Date().toISOString(),
    }
    saveSession(sessionId, [...messages, assistantMsg])

    return { sessionId, message: assistantMsg }
  }

  async *stream(req: ChatRequest): AsyncGenerator<StreamChunk> {
    // For now, delegate to chat() and yield as single chunk
    // TODO: wire up streaming SDK calls in Phase 2
    try {
      const response = await this.chat(req)
      yield { type: 'text', content: response.message.content, sessionId: response.sessionId }
      yield { type: 'done', content: '',                        sessionId: response.sessionId }
    } catch (err: any) {
      yield { type: 'error', content: err.message, sessionId: req.sessionId ?? '' }
    }
  }
}
