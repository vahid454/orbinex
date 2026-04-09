import type { ToolDefinition, ToolCallRequest, ToolCallResult } from '@orbinex/shared'
import { McpServerError, MCP_TIMEOUT_MS } from '@orbinex/shared'

export class McpService {
  async listTools(mcpServerUrl: string, apiKey?: string): Promise<ToolDefinition[]> {
    const res = await fetch(`${mcpServerUrl}/tools`, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
      signal: AbortSignal.timeout(MCP_TIMEOUT_MS),
    })
    if (!res.ok) throw new McpServerError(`listTools failed with status ${res.status}`)
    return res.json()
  }

  async call(
    mcpServerUrl: string,
    request: ToolCallRequest,
    apiKey?: string
  ): Promise<ToolCallResult> {
    const res = await fetch(`${mcpServerUrl}/tools/call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(MCP_TIMEOUT_MS),
    })
    if (!res.ok) throw new McpServerError(`tool call failed with status ${res.status}`)
    return res.json()
  }
}
