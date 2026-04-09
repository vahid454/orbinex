import { OrbinexWidget } from './widget'
import type { WidgetConfig } from './types'

// Production: auto-init from <script> tag attributes
// <script src="orbinex.js" data-tenant="..." data-engine="..." ...></script>
function autoInit() {
  const script = document.currentScript as HTMLScriptElement | null
  if (!script) return

  const tenantId = script.dataset.tenant ?? script.dataset.orbinexTenant
  if (!tenantId) {
    console.warn('[Orbinex] Missing data-tenant attribute on the <script> tag')
    return
  }

  const cfg: WidgetConfig = {
    tenantId,
    engineUrl:      script.dataset.engine      ?? 'https://orbinex-engine.onrender.com',
    mode:          (script.dataset.mode         ?? 'bubble') as WidgetConfig['mode'],
    position:      (script.dataset.position     ?? 'bottom-right') as WidgetConfig['position'],
    primaryColor:   script.dataset.color        ?? '#6C5CE7',
    title:          script.dataset.title        ?? 'AI Assistant',
    placeholder:    script.dataset.placeholder  ?? 'Type a message…',
    welcomeMessage: script.dataset.welcome      ?? undefined,
  }

  new OrbinexWidget(cfg).mount()
}

autoInit()
;(window as any).OrbinexWidget = OrbinexWidget
