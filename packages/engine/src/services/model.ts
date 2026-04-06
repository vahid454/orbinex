import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import type { OrbinexConfig } from '../config'

type SimpleMessage = { role: string; content: any; tool_call_id?: string }

type ToolDef = {
  type: 'function'
  function: { name: string; description: string; parameters: Record<string, unknown> }
}

type CompleteResult =
  | { type: 'text'; content: string }
  | { type: 'tool_calls'; toolCalls: { id: string; name: string; arguments: Record<string, unknown> }[]; rawMessage: any }

export class ModelService {

  async completeWithTools(
    config: OrbinexConfig,
    messages: SimpleMessage[],
    tools: ToolDef[]
  ): Promise<CompleteResult> {
    switch (config.provider) {
      case 'anthropic': return this.anthropicComplete(config, messages, tools)
      case 'ollama':    return this.ollamaNativeComplete(config, messages, tools)
      default:          return this.openaiComplete(config, messages, tools)
    }
  }

  // ── Ollama — uses native /api/chat which has reliable tool support ─
  private async ollamaNativeComplete(
    config: OrbinexConfig,
    messages: SimpleMessage[],
    tools: ToolDef[]
  ): Promise<CompleteResult> {
    // Ollama native base URL: strip /v1 suffix if present
    const base = (config.baseUrl ?? 'http://localhost:11434').replace(/\/v1\/?$/, '')

    const ollamaTools = tools.map(t => ({
      type: 'function' as const,
      function: {
        name:        t.function.name,
        description: t.function.description,
        parameters:  t.function.parameters,
      },
    }))

    const body: Record<string, unknown> = {
      model:    config.model,
      messages: messages.map(m => ({
        role:         m.role,
        content:      typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
        tool_call_id: m.tool_call_id,
      })),
      stream: false,
      options: {
        temperature: config.temperature,
        num_predict: config.maxTokens,
      },
    }

    if (tools.length) body.tools = ollamaTools

    const res = await fetch(`${base}/api/chat`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
      signal:  AbortSignal.timeout(120_000),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Ollama error ${res.status}: ${text}`)
    }

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

  // ── Anthropic ────────────────────────────────────────────────
  private async anthropicComplete(
    config: OrbinexConfig,
    messages: SimpleMessage[],
    tools: ToolDef[]
  ): Promise<CompleteResult> {
    const client = new Anthropic({ apiKey: config.apiKey })
    const system = messages.find(m => m.role === 'system')?.content ?? ''
    const hist   = messages.filter(m => m.role !== 'system')

    const anthropicTools = tools.map(t => ({
      name:         t.function.name,
      description:  t.function.description,
      input_schema: t.function.parameters as any,
    }))

    const res = await client.messages.create({
      model:      config.model,
      max_tokens: config.maxTokens,
      system,
      messages:   hist as any,
      tools:      anthropicTools.length ? anthropicTools : undefined,
    })

    if (res.stop_reason === 'tool_use') {
      const calls = res.content
        .filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
        .map(b => ({ id: b.id, name: b.name, arguments: b.input as Record<string, unknown> }))
      return { type: 'tool_calls', toolCalls: calls, rawMessage: res.content }
    }

    const textBlock = res.content.find((b): b is Anthropic.TextBlock => b.type === 'text')
    return { type: 'text', content: textBlock?.text ?? '' }
  }

  // ── OpenAI / Gemini (OpenAI-compat) ─────────────────────────
  private async openaiComplete(
    config: OrbinexConfig,
    messages: SimpleMessage[],
    tools: ToolDef[]
  ): Promise<CompleteResult> {
    const client = new OpenAI({ apiKey: config.apiKey, baseURL: config.baseUrl })

    const params: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
      model:       config.model,
      max_tokens:  config.maxTokens,
      temperature: config.temperature,
      messages:    messages as any,
      ...(tools.length ? { tools: tools as any } : {}),
    }

    const res = await client.chat.completions.create(params)
    const msg = res.choices[0].message

    if (msg.tool_calls?.length) {
      const calls = msg.tool_calls.map(tc => ({
        id:        tc.id,
        name:      tc.function.name,
        arguments: JSON.parse(tc.function.arguments ?? '{}') as Record<string, unknown>,
      }))
      return { type: 'tool_calls', toolCalls: calls, rawMessage: msg }
    }

    return { type: 'text', content: msg.content ?? '' }
  }
}