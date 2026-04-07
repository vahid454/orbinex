import { OrbinexWidget } from './widget'
import type { WidgetConfig } from './types'

const cfg: WidgetConfig = {
  tenantId:       'test-tenant-001',
  engineUrl:      'http://localhost:3001',
  mode:           'bubble',
  position:       'bottom-right',
  primaryColor:   '#6C5CE7',
  title:          'Orbinex AI',
  placeholder:    'Ask me anything…',
  welcomeMessage: 'Hi! 👋 Ask me about weather, cities, math, currencies, or upload a PDF to chat with your documents.',
}

new OrbinexWidget(cfg).mount()