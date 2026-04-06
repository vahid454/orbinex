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
  type:      'text' | 'tool_call' | 'tool_result' | 'done' | 'error'
  content:   string
  sessionId: string
}
