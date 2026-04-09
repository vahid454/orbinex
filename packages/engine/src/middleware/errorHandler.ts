import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify'
import { OrbinexError } from '../shared-lib/index'

export function errorHandler(
  err: FastifyError,
  _req: FastifyRequest,
  reply: FastifyReply
) {
   console.log('🔴 Error caught:', err)
  
  // TEMPORARY BYPASS - remove after debugging
  if (err.statusCode === 403) {
    return reply.code(200).send({ bypassed: true, message: 'Temporary bypass' })
  }
  if (err instanceof OrbinexError) {
    return reply.code(err.statusCode).send({ error: err.code, message: err.message })
  }
  if (err.statusCode) {
    return reply.code(err.statusCode).send({ error: 'REQUEST_ERROR', message: err.message })
  }
  console.error('[Orbinex Engine] Unhandled error:', err)
  return reply.code(500).send({ error: 'INTERNAL_ERROR', message: 'Something went wrong' })
}
