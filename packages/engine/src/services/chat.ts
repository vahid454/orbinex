import type { ChatRequest, ChatResponse, StreamChunk, Message } from '../shared-lib/index'
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
            type: (v as any).type,
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
    let loopMessages: any[] = [
      { role: 'system' as const, content: config.systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
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
        loopMessages.push({ role: 'assistant', content: result.rawMessage })

        for (const call of result.toolCalls) {
          console.log(`[ChatService] Calling tool: ${call.name}(${JSON.stringify(call.arguments)})`)
          try {
            const toolResult = await mcpService.call(mcpUrl, {
              toolName:   call.name,
              parameters: call.arguments,
            }, apiKey)
            loopMessages.push({
            role: 'user',
            content: `The tool "${call.name}" returned this result: ${JSON.stringify(toolResult.result)}. Now answer the user's question based on this information.`
})
          } catch (err: any) {
            loopMessages.push({
              role: 'user',
              content: `Error occurred while calling tool "${call.name}": ${err.message}`
            })
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
    const sessionId = req.sessionId ?? makeId()
    const history   = getSession(sessionId)
    const tools     = await getToolSchemas()

    const userMsg: Message = {
      id: makeId(), role: 'user',
      content: req.message, createdAt: new Date().toISOString(),
    }
    const messages = [...history, userMsg]

    yield { type: 'text', content: '', sessionId, metadata: { userMessage: userMsg } } as any

    let finalContent = ''
    let loopMessages: any[] = [
      { role: 'system' as const, content: config.systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ]

    for (let i = 0; i < 5; i++) {
      let result;
      try {
        result = await modelService.completeWithTools(
          config, loopMessages, buildToolDefs(tools)
        );
      } catch (err: any) {
        console.error('LLM call failed:', err);
        yield { type: 'error', content: `AI error: ${err.message}`, sessionId } as any;
        break;
      }

      if (result.type === 'text') {
        finalContent = result.content;
        // Stream final text in chunks
        const words = result.content.split(' ');
        for (let j = 0; j < words.length; j++) {
          yield { type: 'text', content: words[j] + (j < words.length - 1 ? ' ' : ''), sessionId };
          await new Promise(r => setTimeout(r, 20));
        }
        break;
      }

      if (result.type === 'tool_calls') {
        const mcpUrl = process.env.MCP_SERVER_URL ?? 'http://localhost:3002';
        const apiKey = process.env.MCP_API_KEY;

        // Add assistant message with tool_calls (required by OpenAI)
        loopMessages.push({ role: 'assistant', content: result.rawMessage });

        for (const call of result.toolCalls) {
          yield {
            type: 'tool_call',
            content: `Calling tool: ${call.name}...`,
            sessionId,
            toolCall: { name: call.name, arguments: call.arguments }
          } as any;

          console.log(`[ChatService] Calling tool: ${call.name}(${JSON.stringify(call.arguments)})`);
          try {
            const toolResult = await mcpService.call(mcpUrl, {
              toolName: call.name,
              parameters: call.arguments,
            }, apiKey);

            yield {
              type: 'tool_result',
              content: `Tool result received for: ${call.name}`,
              sessionId,
              toolResult: { name: call.name, result: toolResult.result }
            } as any;

            // Append tool result as a user message (works with all providers)
            loopMessages.push({
              role: 'user',
              content: `The tool "${call.name}" returned: ${JSON.stringify(toolResult.result)}. Use this to answer the user's question.`
            });
          } catch (err: any) {
            yield { type: 'error', content: `Tool error: ${err.message}`, sessionId } as any;
            loopMessages.push({
              role: 'user',
              content: `Error calling tool "${call.name}": ${err.message}`
            });
          }
        }
        // Continue the loop – next iteration will call LLM with tool results
        continue;
      }
      break;
    }

    // Fallback: if no final content was generated, produce a generic answer
    if (!finalContent) {
      finalContent = "I'm sorry, I couldn't generate a response. Please try again.";
      yield { type: 'text', content: finalContent, sessionId } as any;
    }

    const assistantMsg: Message = {
      id: makeId(), role: 'assistant',
      content: finalContent, createdAt: new Date().toISOString(),
    };
    saveSession(sessionId, [...messages, assistantMsg]);

    yield { type: 'done', content: '', sessionId } as any;
  }
}