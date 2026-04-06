import type { ToolDefinition } from '@orbinex/shared'

// Extend ToolDefinition with a handler function
export interface OrbinexTool extends ToolDefinition {
  handler: (params: Record<string, unknown>) => Promise<unknown>
}
