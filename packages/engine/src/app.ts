import Fastify from 'fastify'
import cors    from '@fastify/cors'
import { chatRoutes }   from './routes/chat'
import { tenantRoutes } from './routes/tenant'
import { healthRoutes } from './routes/health'
import { errorHandler } from './middleware/errorHandler'
import config from './config'

export async function buildApp() {
  const app = Fastify({ logger: process.env.NODE_ENV !== 'test' })

  // ── CORS ─────────────────────────────────────────────────
  await app.register(cors, {
    origin: true,          // allow all origins in dev; restrict in production
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  // ── Routes ───────────────────────────────────────────────
  await app.register(healthRoutes, { prefix: '/health' })
  await app.register(tenantRoutes, { prefix: '/api/tenants' })
  await app.register(chatRoutes,   { prefix: '/api/chat' })

  // ── Startup log ──────────────────────────────────────────
  app.addHook('onReady', async () => {
    console.log(`\n🚀 Orbinex Engine ready`)
    console.log(`   Provider : ${config.provider}`)
    console.log(`   Model    : ${config.model}`)
    console.log(`   Base URL : ${config.baseUrl ?? '(provider default)'}`)
    console.log(`   MCP URL  : ${process.env.MCP_SERVER_URL ?? 'http://localhost:3002'}\n`)
  })

  app.setErrorHandler(errorHandler)
  return app
}
