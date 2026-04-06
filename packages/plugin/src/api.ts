import type { StreamChunk } from './types'

export class ChatApi {
  private sessionId?: string

  constructor(
    private engineUrl: string,
    private tenantId:  string
  ) {}

  getSessionId() { return this.sessionId }

  async *stream(message: string, signal?: AbortSignal): AsyncGenerator<StreamChunk> {
    let res: Response
    try {
      res = await fetch(`${this.engineUrl}/api/chat/stream`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        signal,
        body: JSON.stringify({
          tenantId:  this.tenantId,
          sessionId: this.sessionId,
          message,
        }),
      })
    } catch (e: any) {
      if (e?.name === 'AbortError') return
      yield { type: 'error', content: 'Cannot reach Orbinex Engine. Is it running on port 3001?', sessionId: '' }
      return
    }

    if (!res.ok || !res.body) {
      yield { type: 'error', content: `Server error ${res.status}`, sessionId: '' }
      return
    }

    const reader  = res.body.getReader()
    const decoder = new TextDecoder()
    let   buf     = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') return
          try {
            const chunk = JSON.parse(data) as StreamChunk
            if (chunk.sessionId) this.sessionId = chunk.sessionId
            yield chunk
          } catch {}
        }
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') throw e
    } finally {
      reader.cancel().catch(() => {})
    }
  }
}