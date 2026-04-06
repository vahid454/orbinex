import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import type { OrbinexConfig } from '../config'
import { ANTHROPIC_SYSTEM_WITH_CACHE } from '../prompts/system'

type SimpleMessage = { role: string; content: any; tool_call_id?: string }
type ToolDef = {
  type: 'function'
  function: { name: string; description: string; parameters: Record<string, unknown> }
}
type CompleteResult =
  | { type: 'text'; content: string }
  | { type: 'tool_calls'; toolCalls: { id: string; name: string; arguments: Record<string, unknown> }[]; rawMessage: any }

export class ModelService {
  async completeWithTools(config: OrbinexConfig, messages: SimpleMessage[], tools: ToolDef[]): Promise<CompleteResult> {
    switch (config.provider) {
      case 'anthropic': return this.anthropicComplete(config, messages, tools)
      case 'ollama':    return this.ollamaNativeComplete(config, messages, tools)
      default:          return this.openaiComplete(config, messages, tools)
    }
  }

  // ── Ollama native /api/chat — reliable tool calling ───────────
  private async ollamaNativeComplete(config: OrbinexConfig, messages: SimpleMessage[], tools: ToolDef[]): Promise<CompleteResult> {
    const base = (config.baseUrl ?? 'http://localhost:11434').replace(/\/v1\/?$/, '')
    const body: Record<string, unknown> = {
      model:   config.model,
      stream:  false,
      options: { temperature: config.temperature, num_predict: config.maxTokens },
      messages: messages.map(m => ({
        role:    m.role,
        content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
        ...(m.tool_call_id ? { tool_call_id: m.tool_call_id } : {}),
      })),
    }
    if (tools.length) {
      body.tools = tools.map(t => ({ type: 'function', function: { name: t.function.name, description: t.function.description, parameters: t.function.parameters } }))
    }

    const res = await fetch(`${base}/api/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal: AbortSignal.timeout(120_000),
    })
    if (!res.ok) { const t = await res.text(); throw new Error(`Ollama ${res.status}: ${t}`) }

    const data = await res.json() as any
    const msg  = data.message

    if (msg?.tool_calls?.length) {
      const calls = (msg.tool_calls as any[]).map((tc: any, i: number) => ({
        id:        `call_${i}`,
        name:      tc.function?.name ?? tc.name,
        arguments: tc.function?.arguments ?? tc.arguments ?? {},
      }))
      return { type: 'tool_calls', toolCalls: calls, rawMessage: msg }
    }
    return { type: 'text', content: msg?.content ?? '' }
  }

  // ── Anthropic with prompt caching ─────────────────────────────
  private async anthropicComplete(config: OrbinexConfig, messages: SimpleMessage[], tools: ToolDef[]): Promise<CompleteResult> {
    const client = new Anthropic({ apiKey: config.apiKey })
    const hist   = messages.filter(m => m.role !== 'system')

    // Use cached system prompt if enabled
    const systemContent = config.promptCaching
      ? ANTHROPIC_SYSTEM_WITH_CACHE
      : messages.find(m => m.role === 'system')?.content ?? config.systemPrompt

    const anthropicTools = tools.map(t => ({
      name: t.function.name, description: t.function.description,
      input_schema: t.function.parameters as any,
    }))

    const res = await (client.beta as any).promptCaching.messages.create({
      model: config.model, max_tokens: config.maxTokens,
      system:   systemContent,
      messages: hist as any,
      tools:    anthropicTools.length ? anthropicTools : undefined,
      betas:    ['prompt-caching-2024-07-31'],
    }).catch(() =>
      // Fallback to regular API if beta isn't available
      client.messages.create({
        model: config.model, max_tokens: config.maxTokens,
        system:   config.systemPrompt,
        messages: hist as any,
        tools:    anthropicTools.length ? anthropicTools : undefined,
      })
    )

    if (res.stop_reason === 'tool_use') {
      const calls = res.content
        .filter((b: any): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
        .map((b: any) => ({ id: b.id, name: b.name, arguments: b.input as Record<string, unknown> }))
      return { type: 'tool_calls', toolCalls: calls, rawMessage: res.content }
    }
    const textBlock = res.content.find((b: any): b is Anthropic.TextBlock => b.type === 'text')
    return { type: 'text', content: textBlock?.text ?? '' }
  }

  // ── OpenAI / Gemini ────────────────────────────────────────────
  private async openaiComplete(config: OrbinexConfig, messages: SimpleMessage[], tools: ToolDef[]): Promise<CompleteResult> {
    const client = new OpenAI({ apiKey: config.apiKey, baseURL: config.baseUrl })
    const params: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
      model: config.model, max_tokens: config.maxTokens, temperature: config.temperature,
      messages: messages as any,
      ...(tools.length ? { tools: tools as any } : {}),
    }
    const res = await client.chat.completions.create(params)
    const msg = res.choices[0].message
    if (msg.tool_calls?.length) {
      const calls = msg.tool_calls.map(tc => ({
        id: tc.id, name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments ?? '{}') as Record<string, unknown>,
      }))
      return { type: 'tool_calls', toolCalls: calls, rawMessage: msg }
    }
    return { type: 'text', content: msg.content ?? '' }
  }
}