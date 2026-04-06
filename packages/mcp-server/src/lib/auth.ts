import type { FastifyRequest, FastifyReply } from 'fastify'

// Simple bearer-token auth. Set MCP_API_KEY env var to enforce.
// Leave unset to allow unauthenticated access (useful for local dev).
export async function authMiddleware(req: FastifyRequest, reply: FastifyReply) {
  const apiKey = process.env.MCP_API_KEY
  if (!apiKey) return   // auth disabled

  const header = req.headers.authorization ?? ''
  const token  = header.startsWith('Bearer ') ? header.slice(7) : ''

  if (token !== apiKey) {
    return reply.code(401).send({ error: 'UNAUTHORIZED', message: 'Invalid API key' })
  }
}
