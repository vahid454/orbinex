import type { WidgetConfig } from './types'
import { createStyles } from './styles'
import { ChatApi } from './api'

// SVG icon set
const I = {
  chat:    `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`,
  send:    `<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`,
  stop:    `<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>`,
  close:   `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
  menu:    `<svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>`,
  sun:     `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`,
  moon:    `<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`,
  trash:   `<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
  plus:    `<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`,
  copy:    `<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`,
  expand:  `<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`,
  shrink:  `<svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`,
}

interface Msg { role: 'user'|'assistant'; content: string; time: string }
interface Session { id: string; title: string; messages: Msg[]; updatedAt: number }

// Simple markdown renderer
function md(raw: string): string {
  let s = raw
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  // Code blocks first
  s = s.replace(/```(\w*)\n?([\s\S]*?)```/g, (_,lang,code) =>
    `<pre><code class="lang-${lang}">${code.trim()}</code></pre>`)
  // Inline code
  s = s.replace(/`([^`\n]+)`/g, '<code>$1</code>')
  // Tables
  s = s.replace(/^\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)+)/gm, (_,head,body) => {
    const ths = head.split('|').filter((c:string)=>c.trim()).map((c:string)=>`<th>${c.trim()}</th>`).join('')
    const rows = body.trim().split('\n').map((r:string) =>
      '<tr>' + r.split('|').filter((c:string)=>c.trim()).map((c:string)=>`<td>${c.trim()}</td>`).join('') + '</tr>'
    ).join('')
    return `<table><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`
  })
  // Headings
  s = s.replace(/^### (.+)$/gm,'<h3>$1</h3>')
       .replace(/^## (.+)$/gm,'<h2>$1</h2>')
       .replace(/^# (.+)$/gm,'<h1>$1</h1>')
  // Bold / italic
  s = s.replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>')
       .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
       .replace(/\*(.+?)\*/g,'<em>$1</em>')
  // Blockquote
  s = s.replace(/^> (.+)$/gm,'<blockquote>$1</blockquote>')
  // HR
  s = s.replace(/^---$/gm,'<hr>')
  // Unordered list
  s = s.replace(/((?:^[-*] .+\n?)+)/gm, block =>
    '<ul>' + block.trim().split('\n').map(l=>`<li>${l.replace(/^[-*] /,'')}</li>`).join('') + '</ul>')
  // Ordered list
  s = s.replace(/((?:^\d+\. .+\n?)+)/gm, block =>
    '<ol>' + block.trim().split('\n').map(l=>`<li>${l.replace(/^\d+\. /,'')}</li>`).join('') + '</ol>')
  // Links
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>')
  // Paragraphs — wrap consecutive non-block lines
  s = s.split('\n\n').map(para => {
    const t = para.trim()
    if (!t || /^<(h[1-6]|ul|ol|pre|table|blockquote|hr)/.test(t)) return t
    return `<p>${t.replace(/\n/g,'<br>')}</p>`
  }).join('\n')
  return s
}

export class OrbinexWidget {
  private cfg: WidgetConfig
  private api: ChatApi
  private root!: HTMLElement
  private dark: boolean
  private sbOpen = false
  private streaming = false
  private abort: AbortController|null = null
  private fullscreen = false
  private sessions: Session[] = []
  private sid = ''

  constructor(cfg: WidgetConfig) {
    this.cfg = cfg
    this.api = new ChatApi(cfg.engineUrl, cfg.tenantId)
    try { this.dark = localStorage.getItem('obx_theme') === 'dark' || (!localStorage.getItem('obx_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches) }
    catch { this.dark = false }
    this.loadSessions()
  }

  // ── Sessions ─────────────────────────────────────────────────
  private loadSessions() {
    try { this.sessions = JSON.parse(localStorage.getItem('obx_sessions') ?? '[]') } catch { this.sessions = [] }
    if (!this.sessions.length) this.newSession(false)
    else this.sid = this.sessions[0].id
  }
  private saveSessions() {
    try { localStorage.setItem('obx_sessions', JSON.stringify(this.sessions.slice(0, 60))) } catch {}
  }
  private newSession(render = true) {
    const id = 's_' + Date.now()
    const welcome = this.cfg.welcomeMessage
      ? [{ role: 'assistant' as const, content: this.cfg.welcomeMessage, time: this.ftime() }]
      : []
    this.sessions.unshift({ id, title: 'New chat', messages: welcome, updatedAt: Date.now() })
    this.sid = id
    this.api = new ChatApi(this.cfg.engineUrl, this.cfg.tenantId)
    this.saveSessions()
    if (render) { this.renderMsgs(); this.renderSb() }
  }
  private get sess(): Session { return this.sessions.find(s => s.id === this.sid) ?? this.sessions[0] }
  private ftime() { return new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) }

  // ── Mount ─────────────────────────────────────────────────────
  mount(target?: HTMLElement) {
    if (document.getElementById('obx-root')) return
    const st = document.createElement('style'); st.textContent = createStyles(this.cfg)
    document.head.appendChild(st)
    this.root = document.createElement('div')
    this.root.id = 'obx-root'
    this.root.setAttribute('data-mode', this.cfg.mode)
    this.root.setAttribute('data-theme', this.dark ? 'dark' : 'light')
    this.root.innerHTML = this.html()
    ;(target ?? document.body).appendChild(this.root)
    this.bind()
    this.renderMsgs()
    if (this.cfg.mode === 'fullpage') this.openPanel()
  }

  private html() {
    const title = this.cfg.title ?? 'AI Assistant'
    const initials = title.split(' ').map((w:string)=>w[0]).slice(0,2).join('').toUpperCase()
    return `
<button id="obx-launcher" aria-label="Open chat">${I.chat}</button>

<div id="obx-window" hidden>
  <div id="obx-sb">
    <div class="obx-sb-head">
      <span class="obx-sb-title">History</span>
      <button class="obx-ib" id="obx-new" title="New chat">${I.plus}</button>
    </div>
    <div id="obx-sb-list"></div>
  </div>

  <div id="obx-main">
    <div id="obx-hd">
      <div id="obx-hd-avatar">${initials}</div>
      <div id="obx-hd-info">
        <div id="obx-hd-name">${title}</div>
        <div id="obx-hd-status"><span class="obx-dot"></span><span id="obx-st">Online</span></div>
      </div>
      <div class="obx-hd-acts">
        <button class="obx-ib" id="obx-hist" title="History">${I.menu}</button>
        <button class="obx-ib" id="obx-theme" title="Toggle theme">${this.dark ? I.sun : I.moon}</button>
        <button class="obx-ib" id="obx-fs" title="Fullscreen">${I.expand}</button>
        <button class="obx-ib" id="obx-x" title="Close">${I.close}</button>
      </div>
    </div>

    <div id="obx-msgs" role="log" aria-live="polite"></div>

    <div id="obx-bar">
      <div id="obx-bar-inner">
        <textarea id="obx-in" rows="1" placeholder="${this.cfg.placeholder ?? 'Message…'}" autocomplete="off"></textarea>
        <button id="obx-send" title="Send">${I.send}</button>
      </div>
      <div id="obx-foot">Powered by <a href="#" tabindex="-1">Orbinex</a></div>
    </div>
  </div>
</div>`
  }

  // ── Bind ──────────────────────────────────────────────────────
  private bind() {
    const q = (s: string) => this.root.querySelector(s) as HTMLElement
    q('#obx-launcher').addEventListener('click',  () => this.toggle())
    q('#obx-x').addEventListener('click',         () => this.closePanel())
    q('#obx-hist').addEventListener('click',      () => this.toggleSb())
    q('#obx-new').addEventListener('click',       () => this.newSession())
    q('#obx-theme').addEventListener('click',     () => this.toggleTheme())
    q('#obx-fs').addEventListener('click',        () => this.toggleFs())
    q('#obx-send').addEventListener('click',      () => this.send())
    const inp = q('#obx-in') as HTMLTextAreaElement
    inp.addEventListener('keydown', (e:any) => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); this.send() } })
    inp.addEventListener('input', () => { inp.style.height='auto'; inp.style.height=Math.min(inp.scrollHeight,130)+'px' })
  }

  // ── Panel ─────────────────────────────────────────────────────
  private toggle() { const w = this.root.querySelector('#obx-window') as HTMLElement; w.hidden ? this.openPanel() : this.closePanel() }
  private openPanel() {
    const w = this.root.querySelector('#obx-window') as HTMLElement; w.hidden = false
    this.root.querySelector('#obx-launcher')?.setAttribute('aria-expanded','true')
    setTimeout(() => (this.root.querySelector('#obx-in') as HTMLElement)?.focus(), 80)
  }
  private closePanel() {
    const w = this.root.querySelector('#obx-window') as HTMLElement; w.hidden = true
    if (this.sbOpen) this.toggleSb()
    this.root.querySelector('#obx-launcher')?.setAttribute('aria-expanded','false')
  }

  // ── Sidebar ───────────────────────────────────────────────────
  private toggleSb() {
    this.sbOpen = !this.sbOpen
    const sb = this.root.querySelector('#obx-sb')!
    sb.classList.toggle('open', this.sbOpen)
    if (this.sbOpen) this.renderSb()
  }
  private renderSb() {
    const el = this.root.querySelector('#obx-sb-list')!
    el.innerHTML = this.sessions.map(s => {
      const t = new Date(s.updatedAt).toLocaleDateString([], { month:'short', day:'numeric' })
      return `<div class="obx-si${s.id===this.sid?' active':''}" data-sid="${s.id}">
        <div class="obx-si-icon">💬</div>
        <div class="obx-si-info">
          <div class="obx-si-title">${this.esc(s.title)}</div>
          <div class="obx-si-time">${t}</div>
        </div>
        <button class="obx-si-del" data-sid="${s.id}" title="Delete">${I.trash}</button>
      </div>`
    }).join('')
    el.querySelectorAll('.obx-si').forEach(el => el.addEventListener('click', (e:any) => {
      if (e.target.closest('.obx-si-del')) return
      this.switchSess((el as HTMLElement).dataset.sid!)
    }))
    el.querySelectorAll('.obx-si-del').forEach(btn => btn.addEventListener('click', (e:any) => {
      e.stopPropagation(); this.delSess((btn as HTMLElement).dataset.sid!)
    }))
  }
  private switchSess(id: string) {
    this.sid = id; this.api = new ChatApi(this.cfg.engineUrl, this.cfg.tenantId)
    this.renderMsgs(); this.renderSb(); if (this.sbOpen) this.toggleSb()
  }
  private delSess(id: string) {
    this.sessions = this.sessions.filter(s => s.id !== id)
    if (!this.sessions.length) this.newSession(false)
    else if (this.sid === id) this.sid = this.sessions[0].id
    this.saveSessions(); this.renderMsgs(); this.renderSb()
  }

  // ── Theme ─────────────────────────────────────────────────────
  private toggleTheme() {
    this.dark = !this.dark
    this.root.setAttribute('data-theme', this.dark ? 'dark' : 'light')
    const btn = this.root.querySelector('#obx-theme')!
    btn.innerHTML = this.dark ? I.sun : I.moon
    try { localStorage.setItem('obx_theme', this.dark ? 'dark' : 'light') } catch {}
  }

  // ── Fullscreen ────────────────────────────────────────────────
  private toggleFs() {
    this.fullscreen = !this.fullscreen
    this.root.classList.toggle('fullscreen', this.fullscreen)
    const btn = this.root.querySelector('#obx-fs')!
    btn.innerHTML = this.fullscreen ? I.shrink : I.expand
    btn.setAttribute('title', this.fullscreen ? 'Exit fullscreen' : 'Fullscreen')
  }

  // ── Render messages ───────────────────────────────────────────
  private renderMsgs() {
    const c = this.root.querySelector('#obx-msgs')!
    c.innerHTML = ''
    const msgs = this.sess.messages
    if (!msgs.length) {
      c.innerHTML = `<div class="obx-empty">
        <div class="obx-empty-icon">🤖</div>
        <div class="obx-empty-t">How can I help?</div>
        <div class="obx-empty-s">Ask me about weather, math, news, cities, currencies, or your documents.</div>
        <div class="obx-chips">
          <span class="obx-chip" data-msg="What's the weather in Mumbai?">🌤 Weather</span>
          <span class="obx-chip" data-msg="Convert 100 USD to INR">💱 Currency</span>
          <span class="obx-chip" data-msg="Tell me about Paris">🗺 City tour</span>
          <span class="obx-chip" data-msg="Calculate 15% of 2500">🧮 Calculate</span>
        </div>
      </div>`
      c.querySelectorAll('.obx-chip').forEach(ch =>
        ch.addEventListener('click', () => {
          const msg = (ch as HTMLElement).dataset.msg ?? ''
          const inp = this.root.querySelector('#obx-in') as HTMLTextAreaElement
          inp.value = msg; this.send()
        })
      )
      return
    }
    let lastDate = ''
    msgs.forEach(m => {
      const d = new Date().toLocaleDateString([], { weekday:'long', month:'short', day:'numeric' })
      if (d !== lastDate) {
        lastDate = d
        c.insertAdjacentHTML('beforeend', `<div class="obx-sep"><span>${d}</span></div>`)
      }
      this.appendRow(m.role, m.content, m.time, false)
    })
    this.scrollBot()
  }

  private appendRow(role: 'user'|'assistant', content: string, time?: string, save = true): HTMLElement {
    const c = this.root.querySelector('#obx-msgs')!
    c.querySelector('.obx-empty')?.remove()
    const t = time ?? this.ftime()
    const row = document.createElement('div')
    row.className = `obx-row obx-row--${role==='user'?'u':'a'}`
    const initials = (this.cfg.title ?? 'AI').split(' ').map((w:string)=>w[0]).slice(0,2).join('').toUpperCase()
    const av = role === 'assistant' ? `<div class="obx-av">${initials[0]}</div>` : ''
    row.innerHTML = `<div class="obx-msg-wrap">
      ${av}
      <div class="obx-bbl">${md(content)}</div>
    </div>
    <div class="obx-meta">
      <span class="obx-time">${t}</span>
      ${role==='assistant' ? `<button class="obx-copy">${I.copy} Copy</button>` : ''}
    </div>`
    row.querySelector('.obx-copy')?.addEventListener('click', () => {
      navigator.clipboard?.writeText(content)
      const btn = row.querySelector('.obx-copy')!; btn.innerHTML = '✓ Copied'
      setTimeout(() => { btn.innerHTML = I.copy + ' Copy' }, 1600)
    })
    c.appendChild(row)
    if (save) {
      this.sess.messages.push({ role, content, time: t })
      this.sess.updatedAt = Date.now()
      if (role==='user' && this.sess.messages.filter(m=>m.role==='user').length===1)
        this.sess.title = content.slice(0,42)+(content.length>42?'…':'')
      this.saveSessions()
    }
    this.scrollBot()
    return row
  }

  private addTyping(): HTMLElement {
    const c = this.root.querySelector('#obx-msgs')!
    c.querySelector('.obx-empty')?.remove()
    const el = document.createElement('div')
    el.className = 'obx-row obx-row--a'; el.id = 'obx-ty'
    const initials = (this.cfg.title ?? 'AI')[0].toUpperCase()
    el.innerHTML = `<div class="obx-msg-wrap"><div class="obx-av">${initials}</div><div class="obx-bbl"><div class="obx-typing"><span></span><span></span><span></span></div></div></div>`
    c.appendChild(el); this.scrollBot(); return el
  }

  private scrollBot() { const c=this.root.querySelector('#obx-msgs'); if(c) c.scrollTop=c.scrollHeight }

  // ── Send ──────────────────────────────────────────────────────
  private async send() {
    if (this.streaming) { this.abort?.abort(); return }
    const inp = this.root.querySelector('#obx-in') as HTMLTextAreaElement
    const text = inp.value.trim(); if (!text) return
    inp.value=''; inp.style.height='auto'
    this.appendRow('user', text)
    const tyEl = this.addTyping()
    this.setStreaming(true)
    let full=''; let first=true
    this.abort = new AbortController()
    try {
      for await (const chunk of this.api.stream(text, this.abort.signal)) {
        if (chunk.type==='text') {
          full += chunk.content
          if (first) { tyEl.remove(); first=false; this.appendRow('assistant', full, undefined, false).id='obx-live' }
          else { const b=this.root.querySelector('#obx-live .obx-bbl'); if(b) b.innerHTML=md(full) }
          this.scrollBot()
        }
        if (chunk.type==='done'||chunk.type==='error') break
      }
    } catch(e:any) { if(e?.name!=='AbortError') { tyEl.remove(); this.appendRow('assistant',`⚠ ${e.message}`) } }
    tyEl.remove()
    const live=this.root.querySelector('#obx-live'); if(live) { live.removeAttribute('id'); if(full) { this.sess.messages.push({role:'assistant',content:full,time:this.ftime()}); this.sess.updatedAt=Date.now(); this.saveSessions() } }
    this.setStreaming(false); this.abort=null
    setTimeout(() => (inp as HTMLElement).focus(), 50)
  }

  private setStreaming(on: boolean) {
    this.streaming = on
    const btn=this.root.querySelector('#obx-send')!; const st=this.root.querySelector('#obx-st')
    btn.innerHTML = on ? I.stop : I.send
    btn.classList.toggle('stop', on)
    btn.setAttribute('title', on ? 'Stop' : 'Send')
    if (st) st.textContent = on ? 'Thinking…' : 'Online'
  }

  private esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }
}