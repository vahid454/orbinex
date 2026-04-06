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
  welcomeMessage: 'Hi! I can help with **weather**, **cities**, **currencies**, **calculations**, **news**, and search your documents. What would you like to know?',
}

new OrbinexWidget(cfg).mount()