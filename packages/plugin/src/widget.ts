import type { WidgetConfig } from './types'
import { createStyles } from './styles'
import { ChatApi } from './api'

const ICONS = {
  chat:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/></svg>`,
  send:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`,
  stop:  `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
  menu:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>`,
  sun:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7a5 5 0 100 10A5 5 0 0012 7zm0-5a1 1 0 011 1v1a1 1 0 01-2 0V3a1 1 0 011-1zm0 17a1 1 0 011 1v1a1 1 0 01-2 0v-1a1 1 0 011-1zm9-9h1a1 1 0 010 2h-1a1 1 0 010-2zM2 11h1a1 1 0 010 2H2a1 1 0 010-2zm15.657-6.657a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707zm-12.02 12.02a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707zm12.02 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 011.414-1.414zM5.636 5.636l.707.707A1 1 0 014.93 7.757l-.707-.707a1 1 0 011.414-1.414z"/></svg>`,
  moon:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
  new:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>`,
  copy:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`,
}

interface ChatSession {
  id: string
  title: string
  messages: Array<{ role: 'user' | 'assistant'; content: string; time: string }>
  createdAt: number
}

export class OrbinexWidget {
  private cfg: WidgetConfig
  private api: ChatApi
  private root!: HTMLElement
  private dark = false
  private sidebarOpen = false
  private streaming = false
  private abortController: AbortController | null = null
  private sessions: ChatSession[] = []
  private activeSessionId = ''

  constructor(cfg: WidgetConfig) {
    this.cfg = cfg
    this.api = new ChatApi(cfg.engineUrl, cfg.tenantId)
    this.dark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
    this.loadSessions()
  }

  // ── Session persistence ───────────────────────────────────
  private loadSessions() {
    try {
      const raw = localStorage.getItem('orbinex_sessions')
      this.sessions = raw ? JSON.parse(raw) : []
    } catch { this.sessions = [] }
    if (!this.sessions.length) this.newSession()
    else this.activeSessionId = this.sessions[0].id
  }

  private saveSessions() {
    try { localStorage.setItem('orbinex_sessions', JSON.stringify(this.sessions.slice(0, 50))) } catch {}
  }

  private newSession() {
    const id = `s_${Date.now()}`
    const session: ChatSession = {
      id, title: 'New chat',
      messages: this.cfg.welcomeMessage
        ? [{ role: 'assistant', content: this.cfg.welcomeMessage, time: this.timeNow() }]
        : [],
      createdAt: Date.now(),
    }
    this.sessions.unshift(session)
    this.activeSessionId = id
    this.api = new ChatApi(this.cfg.engineUrl, this.cfg.tenantId)
    this.saveSessions()
  }

  private get session(): ChatSession {
    return this.sessions.find(s => s.id === this.activeSessionId) ?? this.sessions[0]
  }

  private timeNow() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // ── Mount ─────────────────────────────────────────────────
  mount(target?: HTMLElement) {
    if (document.getElementById('orbinex-root')) return

    const style = document.createElement('style')
    style.id = 'orbinex-styles'
    style.textContent = createStyles(this.cfg)
    document.head.appendChild(style)

    this.root = document.createElement('div')
    this.root.id = 'orbinex-root'
    this.root.setAttribute('data-mode', this.cfg.mode)
    this.root.setAttribute('data-theme', this.dark ? 'dark' : 'light')
    this.root.innerHTML = this.buildHTML()
    ;(target ?? document.body).appendChild(this.root)

    this.bind()
    this.renderMessages()

    if (this.cfg.mode === 'fullpage') this.openPanel()
  }

  private buildHTML() {
    const title = this.cfg.title ?? 'AI Assistant'
    return `
    <div id="obx-bubble" role="button" aria-label="Open chat" tabindex="0">
      <div class="obx-bubble-icon">${ICONS.chat}</div>
      <div class="obx-unread" id="obx-unread" hidden></div>
    </div>

    <div id="obx-panel" hidden role="dialog" aria-modal="true" aria-label="${title}">>

      <!-- Sidebar -->
      <div id="obx-sidebar">
        <div class="obx-sidebar-header">
          <span class="obx-sidebar-title">History</span>
          <button class="obx-icon-btn" id="obx-new-chat" title="New chat">${ICONS.new}</button>
        </div>
        <div id="obx-session-list"></div>
      </div>

      <!-- Main panel -->
      <div id="obx-main">
        <div id="obx-header">
          <button class="obx-icon-btn" id="obx-menu-btn" title="Chat history">${ICONS.menu}</button>
          <div id="obx-header-info">
            <div id="obx-header-title">${title}</div>
            <div id="obx-header-status">
              <span class="obx-dot"></span><span id="obx-status-text">Online</span>
            </div>
          </div>
          <div class="obx-header-actions">
            <button class="obx-icon-btn" id="obx-theme-btn" title="Toggle theme">${ICONS.moon}</button>
            <button class="obx-icon-btn" id="obx-close-btn" title="Close">${ICONS.close}</button>
          </div>
        </div>

        <div id="obx-messages" role="log" aria-live="polite" aria-label="Chat messages"></div>

        <div id="obx-input-area">
          <div id="obx-input-row">
            <textarea id="obx-input" rows="1"
              placeholder="${this.cfg.placeholder ?? 'Message…'}"
              aria-label="Message input"
              autocomplete="off"></textarea>
            <button id="obx-send-btn" title="Send message" aria-label="Send">
              <span id="obx-send-icon">${ICONS.send}</span>
            </button>
          </div>
          <div id="obx-footer">Powered by Orbinex · <span id="obx-model-label">llm</span></div>
        </div>
      </div>

    </div>`
  }

  // ── Bind events ───────────────────────────────────────────
  private bind() {
    const q = (s: string) => this.root.querySelector(s)

    q('#obx-bubble')?.addEventListener('click',   () => this.togglePanel())
    q('#obx-bubble')?.addEventListener('keydown', (e: any) => e.key === 'Enter' && this.togglePanel())
    q('#obx-close-btn')?.addEventListener('click',  () => this.closePanel())
    q('#obx-menu-btn')?.addEventListener('click',   () => this.toggleSidebar())
    q('#obx-theme-btn')?.addEventListener('click',  () => this.toggleTheme())
    q('#obx-new-chat')?.addEventListener('click',   () => this.startNewChat())
    q('#obx-send-btn')?.addEventListener('click',   () => this.send())

    const input = q('#obx-input') as HTMLTextAreaElement
    input?.addEventListener('keydown', (e: any) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send() }
    })
    input?.addEventListener('input', () => {
      input.style.height = 'auto'
      input.style.height = Math.min(input.scrollHeight, 140) + 'px'
    })
  }

  // ── Panel open/close ──────────────────────────────────────
  private togglePanel() {
    const panel = this.root.querySelector('#obx-panel') as HTMLElement
    if (panel.hidden) this.openPanel(); else this.closePanel()
  }
  private openPanel() {
    const panel = this.root.querySelector('#obx-panel') as HTMLElement
    panel.hidden = false
    panel.setAttribute('aria-hidden', 'false')
    setTimeout(() => (this.root.querySelector('#obx-input') as HTMLElement)?.focus(), 100)
    ;(this.root.querySelector('#obx-unread') as HTMLElement).hidden = true
    this.renderSessionList()
  }
  private closePanel() {
    const panel = this.root.querySelector('#obx-panel') as HTMLElement
    panel.hidden = true
    panel.setAttribute('aria-hidden', 'true')
    if (this.sidebarOpen) this.toggleSidebar()
  }

  // ── Sidebar ───────────────────────────────────────────────
  private toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen
    this.root.querySelector('#obx-sidebar')?.classList.toggle('open', this.sidebarOpen)
    this.root.querySelector('#obx-main')?.classList.toggle('sidebar-open', this.sidebarOpen)
    if (this.sidebarOpen) this.renderSessionList()
  }

  private renderSessionList() {
    const list = this.root.querySelector('#obx-session-list')
    if (!list) return
    list.innerHTML = this.sessions.map(s => `
      <div class="obx-session-item ${s.id === this.activeSessionId ? 'active' : ''}" data-sid="${s.id}">
        <span class="obx-session-title">${this.escHtml(s.title)}</span>
        <button class="obx-session-del" data-sid="${s.id}" title="Delete">${ICONS.trash}</button>
      </div>`).join('')

    list.querySelectorAll('.obx-session-item').forEach(el => {
      el.addEventListener('click', (e: any) => {
        if (e.target.closest('.obx-session-del')) return
        this.switchSession((el as HTMLElement).dataset.sid!)
      })
    })
    list.querySelectorAll('.obx-session-del').forEach(btn => {
      btn.addEventListener('click', (e: any) => {
        e.stopPropagation()
        this.deleteSession((btn as HTMLElement).dataset.sid!)
      })
    })
  }

  private switchSession(id: string) {
    this.activeSessionId = id
    this.api = new ChatApi(this.cfg.engineUrl, this.cfg.tenantId)
    this.renderMessages()
    this.renderSessionList()
    if (this.sidebarOpen) this.toggleSidebar()
  }

  private deleteSession(id: string) {
    this.sessions = this.sessions.filter(s => s.id !== id)
    if (!this.sessions.length) this.newSession()
    else if (this.activeSessionId === id) this.activeSessionId = this.sessions[0].id
    this.saveSessions()
    this.renderMessages()
    this.renderSessionList()
  }

  private startNewChat() {
    this.newSession()
    this.renderMessages()
    this.renderSessionList()
    if (this.sidebarOpen) this.toggleSidebar()
    setTimeout(() => (this.root.querySelector('#obx-input') as HTMLElement)?.focus(), 100)
  }

  // ── Theme ─────────────────────────────────────────────────
  private toggleTheme() {
    this.dark = !this.dark
    this.root.setAttribute('data-theme', this.dark ? 'dark' : 'light')
    const btn = this.root.querySelector('#obx-theme-btn')
    if (btn) btn.innerHTML = this.dark ? ICONS.sun : ICONS.moon
    try { localStorage.setItem('orbinex_theme', this.dark ? 'dark' : 'light') } catch {}
  }

  // ── Render messages ───────────────────────────────────────
  private renderMessages() {
    const container = this.root.querySelector('#obx-messages')
    if (!container) return
    container.innerHTML = ''
    if (!this.session.messages.length) {
      container.innerHTML = `<div class="obx-empty">
        <div class="obx-empty-icon">${ICONS.chat}</div>
        <div class="obx-empty-text">Start a conversation</div>
        <div class="obx-empty-sub">Ask me anything — I have tools for weather, cities, currencies and more.</div>
      </div>`
      return
    }
    this.session.messages.forEach(m => this.appendMessage(m.role, m.content, m.time, false))
    this.scrollBottom()
  }

  private appendMessage(role: 'user' | 'assistant', content: string, time?: string, save = true): HTMLElement {
    const container = this.root.querySelector('#obx-messages')!
    const empty = container.querySelector('.obx-empty')
    if (empty) empty.remove()

    const t = time ?? this.timeNow()
    const wrap = document.createElement('div')
    wrap.className = `obx-msg obx-msg--${role}`
    wrap.dataset.role = role

    const bubble = document.createElement('div')
    bubble.className = 'obx-bubble-msg'
    bubble.innerHTML = this.formatContent(content)

    const meta = document.createElement('div')
    meta.className = 'obx-msg-meta'
    meta.innerHTML = `
      <span class="obx-msg-time">${t}</span>
      ${role === 'assistant' ? `<button class="obx-copy-btn" title="Copy">${ICONS.copy}</button>` : ''}
    `

    wrap.appendChild(bubble)
    wrap.appendChild(meta)
    container.appendChild(wrap)

    wrap.querySelector('.obx-copy-btn')?.addEventListener('click', () => {
      navigator.clipboard?.writeText(content)
      const btn = wrap.querySelector('.obx-copy-btn')!
      btn.innerHTML = '✓'
      setTimeout(() => { btn.innerHTML = ICONS.copy }, 1500)
    })

    if (save) {
      this.session.messages.push({ role, content, time: t })
      if (role === 'user' && this.session.messages.filter(m => m.role === 'user').length === 1) {
        this.session.title = content.slice(0, 40) + (content.length > 40 ? '…' : '')
      }
      this.saveSessions()
    }

    this.scrollBottom()
    return wrap
  }

  private formatContent(text: string): string {
    return this.escHtml(text)
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>')
  }

  private escHtml(s: string) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
  }

  private addTypingIndicator(): HTMLElement {
    const container = this.root.querySelector('#obx-messages')!
    const empty = container.querySelector('.obx-empty')
    if (empty) empty.remove()
    const wrap = document.createElement('div')
    wrap.className = 'obx-msg obx-msg--assistant obx-typing-wrap'
    wrap.id = 'obx-typing'
    wrap.innerHTML = `<div class="obx-bubble-msg obx-typing"><span></span><span></span><span></span></div>`
    container.appendChild(wrap)
    this.scrollBottom()
    return wrap
  }

  private scrollBottom() {
    const c = this.root.querySelector('#obx-messages')
    if (c) c.scrollTop = c.scrollHeight
  }

  // ── Send ──────────────────────────────────────────────────
  private async send() {
    if (this.streaming) { this.stopStream(); return }

    const input = this.root.querySelector('#obx-input') as HTMLTextAreaElement
    const text = input.value.trim()
    if (!text) return

    input.value = ''
    input.style.height = 'auto'

    this.appendMessage('user', text)
    const typing = this.addTypingIndicator()
    this.setStreaming(true)

    let fullText = ''
    let firstChunk = true

    this.abortController = new AbortController()

    try {
      for await (const chunk of this.api.stream(text, this.abortController.signal)) {
        if (chunk.type === 'text') {
          fullText += chunk.content
          if (firstChunk) {
            typing.remove()
            firstChunk = false
            const wrap = this.appendMessage('assistant', fullText, undefined, false)
            wrap.id = 'obx-streaming-msg'
          } else {
            const bubble = this.root.querySelector('#obx-streaming-msg .obx-bubble-msg')
            if (bubble) bubble.innerHTML = this.formatContent(fullText)
          }
          this.scrollBottom()
        }
        if (chunk.type === 'done' || chunk.type === 'error') break
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        typing.remove()
        this.appendMessage('assistant', `Sorry, something went wrong: ${e.message}`)
      }
    }

    typing.remove()
    const streamingEl = this.root.querySelector('#obx-streaming-msg')
    if (streamingEl) {
      streamingEl.removeAttribute('id')
      if (fullText) {
        this.session.messages.push({ role: 'assistant', content: fullText, time: this.timeNow() })
        this.saveSessions()
      }
    }

    this.setStreaming(false)
    this.abortController = null
    input.focus()
  }

  private stopStream() {
    this.abortController?.abort()
    this.setStreaming(false)
  }

  private setStreaming(on: boolean) {
    this.streaming = on
    const btn  = this.root.querySelector('#obx-send-btn') as HTMLButtonElement
    const icon = this.root.querySelector('#obx-send-icon')!
    const status = this.root.querySelector('#obx-status-text')
    if (on) {
      icon.innerHTML = ICONS.stop
      btn.classList.add('streaming')
      btn.title = 'Stop'
      if (status) status.textContent = 'Thinking…'
    } else {
      icon.innerHTML = ICONS.send
      btn.classList.remove('streaming')
      btn.title = 'Send'
      if (status) status.textContent = 'Online'
    }
  }
}