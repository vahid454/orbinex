import Fastify from 'fastify'
import cors from '@fastify/cors'
import type { OrbinexTool } from './lib/types'
import { createToolRouter } from './lib/toolRouter'
import { authMiddleware } from './lib/auth'

interface ServerOptions {
  tools: OrbinexTool[]
}

export async function buildMcpServer({ tools }: ServerOptions) {
  const app = Fastify({ logger: true })

  await app.register(cors, { origin: true })

  // Optional API key auth — set MCP_API_KEY env var to enable
  app.addHook('preHandler', authMiddleware)

  // GET  /tools        → list all registered tools and their schemas
  // POST /tools/call   → invoke a tool by name
  const router = createToolRouter(tools)
  await app.register(router, { prefix: '/tools' })

  // Health check
  app.get('/health', async () => ({ status: 'ok', tools: tools.length }))

  return app
}
