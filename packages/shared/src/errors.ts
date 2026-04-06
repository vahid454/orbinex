export class OrbinexError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode = 500
  ) {
    super(message)
    this.name = 'OrbinexError'
  }
}

export class TenantNotFoundError extends OrbinexError {
  constructor(tenantId: string) {
    super('TENANT_NOT_FOUND', `Tenant '${tenantId}' not found`, 404)
  }
}

export class ModelProviderError extends OrbinexError {
  constructor(provider: string, detail: string) {
    super('MODEL_PROVIDER_ERROR', `Provider '${provider}' error: ${detail}`, 502)
  }
}

export class McpServerError extends OrbinexError {
  constructor(detail: string) {
    super('MCP_SERVER_ERROR', `MCP server error: ${detail}`, 502)
  }
}

export class AuthError extends OrbinexError {
  constructor() {
    super('UNAUTHORIZED', 'Invalid or missing API key', 401)
  }
}
