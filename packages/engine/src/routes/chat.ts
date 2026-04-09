import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { ChatService } from '../services/chat'

const chatService = new ChatService()

const ChatBodySchema = z.object({
  sessionId: z.string().optional(),
  message:   z.string().min(1).max(8000),
  tenantId:  z.string().min(1),
})

export const chatRoutes: FastifyPluginAsync = async (app) => {

  // ── Standard JSON response ───────────────────────────────
  app.post('/', async (req, reply) => {
    const body = ChatBodySchema.parse(req.body)
    const response = await chatService.chat(body as any) 
    return reply.send(response)
  })

  // ── Streaming SSE ────────────────────────────────────────
  app.post('/stream', async (req, reply) => {
    const body = ChatBodySchema.parse(req.body)

    reply.raw.setHeader('Content-Type',  'text/event-stream')
    reply.raw.setHeader('Cache-Control', 'no-cache')
    reply.raw.setHeader('Connection',    'keep-alive')
    reply.raw.setHeader('Access-Control-Allow-Origin', '*')

    try {
      for await (const chunk of chatService.stream(body as any)) {
        reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`)
      }
    } catch (err: any) {
      reply.raw.write(`data: ${JSON.stringify({ type: 'error', content: err.message, sessionId: body.sessionId ?? '' })}\n\n`)
    }

    reply.raw.write('data: [DONE]\n\n')
    reply.raw.end()
  })
}
