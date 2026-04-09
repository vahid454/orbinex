import type { TenantConfig } from '../shared-lib/index'

export class TenantService {
  async create(data: Omit<TenantConfig, 'tenantId'>): Promise<TenantConfig> {
    // TODO: generate tenantId, encrypt apiKey, persist to Postgres
    throw new Error('Not implemented')
  }

  async getById(tenantId: string): Promise<TenantConfig> {
    // TODO: fetch from Postgres, decrypt apiKey before returning
    throw new Error('Not implemented')
  }

  async update(tenantId: string, data: Partial<TenantConfig>): Promise<TenantConfig> {
    // TODO: partial update in Postgres
    throw new Error('Not implemented')
  }
}
