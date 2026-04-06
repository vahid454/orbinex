-- Orbinex initial schema
-- Run with: psql $DATABASE_URL -f scripts/migrate.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS tenants (
  tenant_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mcp_server_url  TEXT NOT NULL,
  mcp_api_key     TEXT,                  -- encrypted
  model_provider  TEXT NOT NULL,
  model_name      TEXT NOT NULL,
  model_api_key   TEXT,                  -- encrypted
  model_base_url  TEXT,
  model_config    JSONB DEFAULT '{}'::jsonb,
  widget_config   JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  session_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  messages    JSONB DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_tenant ON sessions(tenant_id);
