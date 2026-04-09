import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify'
import { OrbinexError } from '@orbinex/shared'

export function errorHandler(
  err: FastifyError,
  _req: FastifyRequest,
  reply: FastifyReply
) {
  if (err instanceof OrbinexError) {
    return reply.code(err.statusCode).send({ error: err.code, message: err.message })
  }
  if (err.statusCode) {
    return reply.code(err.statusCode).send({ error: 'REQUEST_ERROR', message: err.message })
  }
  console.error('[Orbinex Engine] Unhandled error:', err)
  return reply.code(500).send({ error: 'INTERNAL_ERROR', message: 'Something went wrong' })
}
