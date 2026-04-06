import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { TenantService } from '../services/tenant'

const CreateTenantSchema = z.object({
  mcpServerUrl: z.string().url(),
  mcpApiKey: z.string().optional(),
  model: z.object({
    provider: z.enum(['anthropic', 'openai', 'google', 'ollama']),
    model: z.string(),
    apiKey: z.string().optional(),
    baseUrl: z.string().url().optional(),
    maxTokens: z.number().optional(),
    temperature: z.number().min(0).max(2).optional(),
  }),
  widgetConfig: z.object({
    mode: z.enum(['bubble', 'panel', 'fullpage']).default('bubble'),
    theme: z.record(z.string()).optional(),
    placeholder: z.string().optional(),
    welcomeMessage: z.string().optional(),
    position: z.enum(['bottom-right', 'bottom-left']).optional(),
  }),
})

export const tenantRoutes: FastifyPluginAsync = async (app) => {
  const tenantService = new TenantService()

  app.post('/', async (req, reply) => {
    const body = CreateTenantSchema.parse(req.body)
    const tenant = await tenantService.create(body)
    return reply.code(201).send(tenant)
  })

  app.get('/:tenantId', async (req) => {
    const { tenantId } = req.params as { tenantId: string }
    return tenantService.getById(tenantId)
  })

  app.patch('/:tenantId', async (req) => {
    const { tenantId } = req.params as { tenantId: string }
    const body = CreateTenantSchema.partial().parse(req.body)
    return tenantService.update(tenantId, body)
  })
}
