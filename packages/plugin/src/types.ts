import { Message } from "../../engine/dist/shared-lib"

export type WidgetMode = 'bubble' | 'panel' | 'fullpage'

export interface WidgetConfig {
  tenantId:      string
  engineUrl:     string
  mode:          WidgetMode
  position?:     'bottom-right' | 'bottom-left'
  primaryColor?: string
  title?:        string
  placeholder?:  string
  welcomeMessage?: string
}

export interface StreamChunk {
  type: 'text' | 'tool_call' | 'tool_result' | 'done' | 'error'
  content: string
  sessionId: string
  metadata?: {
    userMessage?: Message
  }
  toolCall?: {
    name: string
    arguments: Record<string, unknown>
  }
  toolResult?: {
    name: string
    result: unknown
  }
}