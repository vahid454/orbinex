import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import type { OrbinexTool } from './types'
import { McpServerError } from './errors.js'

export function createToolRouter(tools: OrbinexTool[]): FastifyPluginAsync {
  const toolMap = new Map(tools.map(t => [t.name, t]))

  return async (app) => {
    // List tools
    app.get('/', async () =>
      tools.map(({ name, description, parameters }) => ({
        name,
        description,
        parameters,
      }))
    )

    // Call a tool
    app.post('/call', async (req, reply) => {
      const body = z.object({
        toolName: z.string(),
        parameters: z.record(z.unknown()).default({}),
      }).parse(req.body)

      const tool = toolMap.get(body.toolName)
      if (!tool) {
        return reply.code(404).send({
          error: 'TOOL_NOT_FOUND',
          message: `Tool "${body.toolName}" is not registered`,
        })
      }

      try {
        const result = await tool.handler(body.parameters)
        return { toolName: body.toolName, result }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        throw new McpServerError(`Tool "${body.toolName}" threw: ${message}`)
      }
    })
  }
}
