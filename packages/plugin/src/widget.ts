import type { WidgetConfig } from './types'
import { ChatApi } from './api'

// ─── Icon library (Premium modern design) ─────────────────────
const IC: Record<string, string> = {
  chat:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  send:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  stop:    `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="3"/></svg>`,
  x:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  history: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  sun:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><line x1="12" y1="2" x2="12" y2="5.5"/><line x1="12" y1="18.5" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="6.64" y2="6.64"/><line x1="17.36" y1="17.36" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="5.5" y2="12"/><line x1="18.5" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="6.64" y2="17.36"/><line x1="17.36" y1="6.64" x2="19.78" y2="4.22"/></svg>`,
  moon:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  trash:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  plus:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  copy:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  expand:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
  shrink:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/></svg>`,
  mic:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
  micRec:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  upload:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  check:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  sparkle: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2H22l-6.2 4.5 2.4 7.2L12 16.4l-6.2 4.5 2.4-7.2L2 9.2h7.6L12 2z"/></svg>`,
  chevronR:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  pin:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 0 18.8-4.3M22 12.5a10 10 0 0 0-18.8 4.2"/></svg>`,
  tool:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
}

// ─── Markdown renderer (Premium) ──────────────────────────────
function safeEncode(str: string): string { try { return btoa(unescape(encodeURIComponent(str))) } catch { return '' } }
function safeDecode(str: string): string { try { return decodeURIComponent(escape(atob(str))) } catch { return str } }
function md(raw: string): string {
  let s = raw.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  s = s.replace(/```(\w*)\n?([\s\S]*?)```/g, (_,l,c) =>
    `<div class="obx-pre"><div class="obx-pre-bar"><span class="obx-lang">${l||'code'}</span><button class="obx-pre-copy" data-code="${safeEncode(c.trim())}">Copy</button></div><code>${c.trim()}</code></div>`)
  s = s.replace(/\x60([^\x60\n]+)\x60/g,'<code class="obx-ic">$1</code>')
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,'<div class="obx-img-wrap"><img src="$2" alt="$1" class="obx-img" loading="lazy"/><p class="obx-img-alt">$1</p></div>')
  s = s.replace(/^\|(.+)\|\r?\n\|[-:| ]+\|\r?\n((?:\|.+\|\r?\n?)+)/gm,(_,h,b)=>{
    const ths=h.split('|').filter((x:string)=>x.trim()).map((x:string)=>`<th>${x.trim()}</th>`).join('')
    const rows=b.trim().split('\n').map((r:string)=>'<td>'+r.split('|').filter((x:string)=>x.trim()).map((x:string)=>`<tr>${x.trim()}</tr>`).join('')+'</tr>').join('')
    return `<div class="obx-tbl-w"><table class="obx-tbl"><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table></div>`
  })
  s = s.replace(/^#{4} (.+)$/gm,'<h4>$1</h4>').replace(/^#{3} (.+)$/gm,'<h3>$1</h3>')
       .replace(/^#{2} (.+)$/gm,'<h2>$1</h2>').replace(/^# (.+)$/gm,'<h1>$1</h1>')
  s = s.replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>')
       .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>')
       .replace(/~~(.+?)~~/g,'<del>$1</del>')
  s = s.replace(/^&gt; (.+)$/gm,'<blockquote>$1</blockquote>')
  s = s.replace(/^---+$/gm,'<hr>')
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>')
  s = s.replace(/((?:^[ \t]*[-*+] .+\n?)+)/gm,block=>'<ul>'+block.trim().split('\n').map((l:string)=>`<li>${l.replace(/^[ \t]*[-*+] /,'')}</li>`).join('')+'</ul>')
  s = s.replace(/((?:^[ \t]*\d+\. .+\n?)+)/gm,block=>'<ol>'+block.trim().split('\n').map((l:string)=>`<li>${l.replace(/^[ \t]*\d+\. /,'')}</li>`).join('')+'</ol>')
  return s.split(/\n{2,}/).map(b=>{
    const t=b.trim(); if(!t) return ''
    if(/^<(h[1-6]|ul|ol|div|table|blockquote|hr|pre|img)/.test(t)) return t
    return `<p>${t.replace(/\n/g,'<br>')}</p>`
  }).join('')
}

interface Msg { role:'user'|'assistant'; content:string; time:string }
interface Session { id:string; title:string; messages:Msg[]; updatedAt:number }

export class OrbinexWidget {
  private cfg:WidgetConfig
  private api!:ChatApi
  private root!:HTMLElement
  private dark:boolean
  private isOpen=false
  private histOpen=false
  private streaming=false
  private fullscreen=false
  private abort:AbortController|null=null
  private sessions:Session[]=[]
  private sid=''
  private listening=false
  private recog:any=null
  private dragOn=false; private dx=0; private dy=0
  private resizeOn=false; private resizeX=0; private resizeY=0
  private uploadedDoc:string|null=null

  constructor(cfg:WidgetConfig){
    this.cfg=cfg
    try{this.dark=localStorage.getItem('obx_theme')==='dark'||(localStorage.getItem('obx_theme')==null&&window.matchMedia('(prefers-color-scheme:dark)').matches)}
    catch{this.dark=false}
    this.loadSessions()
  }

  private loadSessions(){
    try{this.sessions=JSON.parse(localStorage.getItem('obx_sessions')||'[]')}catch{this.sessions=[]}
    if(!this.sessions.length)this.newSession(false)
    else {this.sid=this.sessions[0].id}
    this.api=new ChatApi(this.cfg.engineUrl,this.cfg.tenantId)
  }
  private newSession(render=true){
    const id='s'+Date.now()
    const msgs:Msg[]=this.cfg.welcomeMessage?[{role:'assistant',content:this.cfg.welcomeMessage,time:this.ft()}]:[]
    this.sessions.unshift({id,title:'New chat',messages:msgs,updatedAt:Date.now()})
    this.sid=id; this.api=new ChatApi(this.cfg.engineUrl,this.cfg.tenantId)
    this.save(); if(render){this.renderMsgs();this.renderHist()}
  }
  private get sess():Session{return this.sessions.find(s=>s.id===this.sid)||this.sessions[0]}
  private save(){try{localStorage.setItem('obx_sessions',JSON.stringify(this.sessions.slice(0,60)))}catch{}}
  private ft(){return new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
  private esc(s:string){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

  // ─── CSS (Premium enterprise design) ────────────────────────────
  private css(){
    const p=this.cfg.primaryColor||'#6C5CE7'
    const right=this.cfg.position!=='bottom-left'
    return `
#obx,#obx *,#obx *::before,#obx *::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased}
#obx{position:fixed;${right?'right:20px':'left:20px'};bottom:20px;z-index:2147483646;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;font-size:14px;
  --p:${p};--p15:color-mix(in srgb,${p} 15%,transparent);--p20:color-mix(in srgb,${p} 20%,transparent);
  --bg:#fff;--bg2:#f7f7f8;--bg3:#eeeef0;--bg4:#e5e5e7;
  --bd:rgba(0,0,0,.08);--bd2:rgba(0,0,0,.12);
  --tx:#111;--tx2:#555;--tx3:#aaa;
  --shadow:0 2px 8px rgba(0,0,0,.06),0 16px 48px rgba(0,0,0,.12),0 4px 16px rgba(0,0,0,.08);
  --r:20px;--t:.2s;
}
#obx[data-theme=dark]{
  --bg:#1a1a1e;--bg2:#26262d;--bg3:#3f3f46;--bg4:#52525b;
  --bd:rgba(255,255,255,.06);--bd2:rgba(255,255,255,.1);
  --tx:#fafafa;--tx2:#a1a1aa;--tx3:#71717a;
  --shadow:0 2px 8px rgba(0,0,0,.3),0 16px 48px rgba(0,0,0,.6);
}
#obx[data-theme=light]{
  --bg:#ffffff;--bg2:#f5f5f5;--bg3:#ececec;--bg4:#d4d4d4;
  --bd:rgba(0,0,0,.06);--bd2:rgba(0,0,0,.1);
  --tx:#1a1a1a;--tx2:#595959;--tx3:#8b8b8b;
  --shadow:0 2px 8px rgba(0,0,0,.08),0 16px 48px rgba(0,0,0,.12);
}

/* Launcher button - premium float */
#obx-btn{
  width:64px;height:64px;border-radius:50%;border:none;cursor:pointer;
  background:var(--p);color:#fff;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 8px 24px rgba(0,0,0,.15),0 4px 12px color-mix(in srgb,var(--p) 60%,transparent);
  transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .25s,opacity .25s;
  position:relative;
  backdrop-filter:blur(12px);
  border:1px solid rgba(255,255,255,.1);
}
#obx-btn:hover{transform:scale(1.12);box-shadow:0 12px 32px rgba(0,0,0,.2),0 8px 20px color-mix(in srgb,var(--p) 50%,transparent)}
#obx-btn:active{transform:scale(.92)}
#obx-btn svg{width:28px;height:28px}
#obx-btn{bottom:20px}
#obx-badge{position:absolute;top:-6px;right:-6px;min-width:22px;height:22px;padding:0 6px;
  background:#ff3b30;border:2px solid white;border-radius:11px;
  font-size:10px;font-weight:700;color:#fff;display:none;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(255,59,48,.4)}
#obx.open #obx-btn{opacity:0;pointer-events:none;transform:scale(.6) translateY(8px)}

/* Chat window */
#obx-win{
  position:fixed;${right?'right:20px':'left:20px'};bottom:14px;
  width:380px;height:520px;min-width:300px;min-height:400px;max-width:90vw;max-height:90vh;
  background:var(--bg);
  border-radius:var(--r);
  box-shadow:var(--shadow),0 0 40px rgba(0,0,0,.1);
  border:1px solid var(--bd);
  display:flex;overflow:hidden;backdrop-filter:blur(10px);
  transform-origin:${right?'bottom right':'bottom left'};
  animation:obx-open .3s cubic-bezier(.32,1.12,.64,1);
  will-change:transform;
}
#obx-win[hidden]{display:none}
#obx-resize{position:absolute;bottom:0;right:0;width:20px;height:20px;cursor:nwse-resize;
  background:linear-gradient(135deg,transparent 60%,color-mix(in srgb,var(--p) 70%,#000) 60%);
  border-radius:0 0 var(--r) 0;opacity:.25;transition:opacity .2s;
  pointer-events:auto;z-index:10}
#obx-win:hover #obx-resize{opacity:.9}
#obx-resize:active{opacity:1;background:linear-gradient(135deg,transparent 60%,var(--p) 60%)}
@keyframes obx-open{from{opacity:0;transform:scale(.82) translateY(24px);filter:blur(4px)}to{opacity:1;transform:scale(1) translateY(0);filter:blur(0)}}
#obx-win.drag,#obx-win.resize{transition:none;animation:none}

/* History panel */
#obx-hist{
  position:absolute;inset:0 auto 0 0;
  width:0;overflow:hidden;
  background:var(--bg);
  display:flex;flex-direction:column;
  z-index:20;
  border-radius:var(--r) 0 0 var(--r);
  border-right:1px solid var(--bd);
  transition:width .26s cubic-bezier(.4,0,.2,1);
}
#obx-hist.on{width:280px;box-shadow:12px 0 40px rgba(0,0,0,.15)}
#obx-hist-bg{display:none;position:absolute;inset:0;z-index:19;background:rgba(0,0,0,.25);border-radius:var(--r)}
#obx-hist.on ~ #obx-hist-bg{display:block}

#obx-hist-hd{
  height:68px;display:flex;align-items:center;justify-content:space-between;
  padding:0 16px;border-bottom:1px solid var(--bd);flex-shrink:0;
}
.obx-hist-logo{display:flex;align-items:center;gap:12px}
.obx-hist-av{width:40px;height:40px;border-radius:12px;
  background:linear-gradient(135deg,var(--p),color-mix(in srgb,var(--p) 60%,#000));
  display:flex;align-items:center;justify-content:center;
  font-weight:700;font-size:14px;color:#fff;flex-shrink:0}
.obx-hist-lbl{font-size:14px;font-weight:600;color:var(--tx)}
.obx-hist-sub{font-size:11px;color:var(--tx3);margin-top:2px}

.obx-new-btn{
  display:flex;align-items:center;justify-content:center;gap:8px;margin:0;padding:16px;
  background:linear-gradient(135deg,var(--p),color-mix(in srgb,var(--p) 85%,#000));
  color:#fff;border:none;border-radius:0;cursor:pointer;font-size:14px;font-weight:600;
  transition:all .15s;box-shadow:0 -2px 8px rgba(0,0,0,.05);width:100%;min-height:52px;border-bottom:1px solid rgba(255,255,255,.1)}
#obx[data-theme=light] .obx-new-btn{color:var(--tx);border-bottom-color:rgba(0,0,0,.08)}
.obx-new-btn:hover{background:linear-gradient(135deg,color-mix(in srgb,var(--p) 110%,#fff),color-mix(in srgb,var(--p) 90%,#000));transform:translateY(-1px)}
.obx-new-btn:active{transform:translateY(0);box-shadow:inset 0 1px 2px rgba(0,0,0,.2)}
.obx-new-btn svg{width:20px;height:20px}

#obx-sess{flex:1;overflow-y:auto;padding:8px 8px 16px}
#obx-sess::-webkit-scrollbar{width:4px}
#obx-sess::-webkit-scrollbar-thumb{background:var(--bd2);border-radius:2px}

.obx-si{
  display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;cursor:pointer;
  transition:all .15s;margin-bottom:4px;
}
.obx-si:hover{background:var(--bg3);transform:translateX(2px)}
.obx-si.act{background:var(--p15);border-left:3px solid var(--p);padding-left:9px}
.obx-si-ic{width:36px;height:36px;border-radius:10px;background:var(--bg3);
  display:flex;align-items:center;justify-content:center;font-size:16px}
.obx-si-tx{flex:1;min-width:0}
.obx-si-t{font-size:13px;font-weight:500;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.obx-si.act .obx-si-t{color:var(--p);font-weight:600}
.obx-si-d{font-size:11px;color:var(--tx3);margin-top:2px}
.obx-si-del{background:none;border:none;cursor:pointer;color:var(--tx3);padding:6px;border-radius:8px;display:flex;opacity:0;transition:all .15s}
.obx-si-del svg{width:14px;height:14px}
.obx-si:hover .obx-si-del{opacity:1}
.obx-si-del:hover{color:#ff3b30;background:rgba(255,59,48,.1);transform:scale(1.1)}

/* Main chat area */
#obx-main{flex:1;display:flex;flex-direction:column;min-width:0;position:relative}

/* Header - for dragging */
#obx-hd{
  height:68px;display:flex;align-items:center;gap:10px;
  padding:0 16px;border-bottom:1px solid var(--bd);
  background:linear-gradient(180deg,var(--bg) 0%,color-mix(in srgb,var(--bg) 95%,var(--p)) 100%);
  flex-shrink:0;
  user-select:none;cursor:grab;
  box-shadow:0 2px 8px rgba(0,0,0,.04);
}
#obx-win.drag #obx-hd{cursor:grabbing}
.obx-hd-av{width:40px;height:40px;border-radius:12px;
  background:linear-gradient(135deg,var(--p),color-mix(in srgb,var(--p) 60%,#000));
  display:flex;align-items:center;justify-content:center;
  font-weight:700;font-size:14px;color:#fff;pointer-events:none;
  box-shadow:0 4px 12px color-mix(in srgb,var(--p) 35%,transparent);
  animation:obx-avatar-pulse 3s ease-in-out infinite;
}
@keyframes obx-avatar-pulse{0%,100%{transform:scale(1);box-shadow:0 4px 12px color-mix(in srgb,var(--p) 35%,transparent)}50%{transform:scale(1.05);box-shadow:0 6px 16px color-mix(in srgb,var(--p) 50%,transparent)}}
.obx-hd-info{flex:1;pointer-events:none}
.obx-hd-name{font-size:15px;font-weight:600;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.obx-hd-st{font-size:11px;color:var(--tx3);display:flex;align-items:center;gap:5px;margin-top:2px}
.obx-dot{width:7px;height:7px;border-radius:50%;background:#22c55e;
  animation:obx-pulse 2.5s infinite;box-shadow:0 0 0 0 rgba(34,197,94,.4)}
@keyframes obx-pulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.4)}60%{box-shadow:0 0 0 5px rgba(34,197,94,0)}}
.obx-acts{display:flex;gap:4px}

.obx-ib{width:36px;height:36px;border-radius:10px;background:none;border:none;
  cursor:pointer;color:var(--tx2);display:flex;align-items:center;justify-content:center;
  transition:all .12s}
.obx-ib svg{width:18px;height:18px}
.obx-ib:hover{background:color-mix(in srgb,var(--p) 15%,transparent);color:var(--p);transform:scale(1.08)}
.obx-ib:active{transform:scale(.92)}

/* Messages */
#obx-msgs{flex:1;overflow-y:auto;padding:20px 14px;display:flex;flex-direction:column;gap:4px;scroll-behavior:smooth;background:linear-gradient(180deg,var(--bg) 0%,color-mix(in srgb,var(--bg) 98%,var(--p)) 100%)}
#obx-msgs::-webkit-scrollbar{width:6px}
#obx-msgs::-webkit-scrollbar-track{background:transparent}
#obx-msgs::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--bd2) 120%,#fff);border-radius:3px}

.obx-date{text-align:center;margin:16px 0 8px}
.obx-date span{font-size:11px;color:var(--tx3);background:var(--bg2);padding:4px 14px;border-radius:20px;border:1px solid var(--bd)}

.obx-row{display:flex;flex-direction:column;margin-bottom:4px;animation:obx-msg-enter .4s cubic-bezier(.34,.84,.68,1.08)}
.obx-row-u{align-items:flex-end}
.obx-row-a{align-items:flex-start}
.obx-inner{display:flex;align-items:flex-end;gap:8px;max-width:85%}
.obx-row-u .obx-inner{flex-direction:row-reverse}
.obx-av-sm{width:28px;height:28px;border-radius:50%;
  background:linear-gradient(135deg,var(--p),color-mix(in srgb,var(--p) 55%,#000));
  display:flex;align-items:center;justify-content:center;
  font-size:10px;font-weight:700;color:#fff}

.obx-bbl{padding:12px 16px;font-size:14px;line-height:1.5;word-break:break-word;border-radius:18px}
.obx-row-u .obx-bbl{background:var(--p);color:#fff;border-radius:18px 18px 4px 18px}
.obx-row-a .obx-bbl{background:var(--bg2);color:var(--tx);border:1px solid var(--bd);border-radius:18px 18px 18px 4px}

.obx-meta{display:flex;align-items:center;gap:8px;padding:4px 8px}
.obx-mt{font-size:10px;color:var(--tx3)}
.obx-cp{background:none;border:none;cursor:pointer;color:var(--tx3);padding:4px;border-radius:6px;opacity:0;transition:all .15s;display:flex}
.obx-row-a:hover .obx-cp{opacity:1}
.obx-cp:hover{color:var(--p);background:var(--p15)}
.obx-cp svg{width:12px;height:12px}

.obx-typing{display:flex;align-items:center;gap:6px;padding:8px 0}
.obx-typing span{width:8px;height:8px;background:var(--tx2);border-radius:50%;animation:obx-bb 1.4s infinite}
.obx-typing span:nth-child(2){animation-delay:.2s}
.obx-typing span:nth-child(3){animation-delay:.4s}
@keyframes obx-bb{0%,80%,100%{transform:scale(.4);opacity:.2}40%{transform:scale(1);opacity:1}}
@keyframes obx-msg-enter{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

.obx-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 24px;gap:16px}
.obx-ei{width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg,var(--p),color-mix(in srgb,var(--p) 55%,#1a0a6b));display:flex;align-items:center;justify-content:center}
.obx-ei svg{width:32px;height:32px;stroke:#fff}
.obx-et{font-size:18px;font-weight:700;color:var(--tx)}
.obx-es{font-size:13px;color:var(--tx2)}
.obx-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:8px}
.obx-chip{background:var(--bg2);border:1px solid var(--bd2);padding:6px 12px;border-radius:20px;font-size:12px;cursor:pointer}
.obx-chip:hover{background:var(--p15);border-color:var(--p);color:var(--p)}

/* Input bar */
#obx-bar{border-top:1px solid var(--bd);background:var(--bg);padding:12px}
#obx-input-row{display:flex;align-items:flex-end;gap:8px}
#obx-in{flex:1;border:1px solid var(--bd2);border-radius:20px;padding:10px 14px;background:var(--bg2);color:var(--tx);font-size:14px;resize:none;outline:none;max-height:100px}
#obx-in:focus{border-color:var(--p);box-shadow:0 0 0 2px var(--p15)}
.obx-bar-btns{display:flex;gap:6px}
#obx-send{width:36px;height:36px;border-radius:50%;background:var(--p);color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
#obx-send:hover{transform:scale(1.05)}
#obx-send.stop{background:#ff3b30}
#obx-foot{font-size:10px;color:var(--tx3);text-align:center;margin-top:8px}

#obx[data-mode=fullpage] #obx-btn{display:none}
#obx[data-mode=fullpage] #obx-win,#obx.fs #obx-win{position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:0!important;width:100vw!important;height:100vh!important;border-radius:0}
#obx.fs #obx-resize{display:none}
@media(max-width:480px){#obx-win{width:calc(100vw - 32px)!important;max-height:calc(100vh - 120px)!important}}
`
  }

  // ─── Mount ────────────────────────────────────────────────────────
  mount(target?: HTMLElement){
    if(document.getElementById('obx')) return
    const st=document.createElement('style'); st.id='obx-css'; st.textContent=this.css()
    document.head.appendChild(st)
    this.root=document.createElement('div'); this.root.id='obx'
    this.root.setAttribute('data-mode',this.cfg.mode||'bubble')
    this.root.setAttribute('data-theme',this.dark?'dark':'light')
    this.root.innerHTML=this.html()
    ;(target||document.body).appendChild(this.root)
    this.bind()
    if(this.cfg.mode==='fullpage') this.open()
  }

  private initials(){
    const t=this.cfg.title||'Orbinex AI'
    return t.split(' ').map((w:string)=>w[0]||'').slice(0,2).join('').toUpperCase()
  }

  private html(){
    const title=this.cfg.title||'Orbinex AI'
    const av=this.initials()
    const ph=this.cfg.placeholder||'Message…'
    return `
<button id="obx-btn" aria-label="Open chat" aria-expanded="false">
  ${IC.chat}
  <div id="obx-badge"></div>
</button>

<div id="obx-win" hidden>
  <div id="obx-resize" title="Drag to resize"></div>
  <div id="obx-hist">
    <div id="obx-hist-hd">
      <div class="obx-hist-logo">
        <div class="obx-hist-av">${av}</div>
        <div><div class="obx-hist-lbl">${this.esc(title)}</div><div class="obx-hist-sub">Chat history</div></div>
      </div>
      <button class="obx-ib" id="obx-hx" title="Close">${IC.x}</button>
    </div>
    <button class="obx-new-btn" id="obx-new">${IC.plus} New chat</button>
    <div id="obx-sess"></div>
  </div>
  <div id="obx-hist-bg"></div>
  <div id="obx-main">
    <div id="obx-hd">
      <button class="obx-ib" id="obx-hb" title="History">${IC.history}</button>
      <div class="obx-hd-av">${av}</div>
      <div class="obx-hd-info">
        <div class="obx-hd-name">${this.esc(title)}</div>
        <div class="obx-hd-st" id="obx-st"><span class="obx-dot"></span>Online</div>
      </div>
      <div class="obx-acts">
        <button class="obx-ib" id="obx-th" title="Theme">${this.dark?IC.sun:IC.moon}</button>
        <button class="obx-ib" id="obx-fs" title="Fullscreen">${IC.expand}</button>
        <button class="obx-ib" id="obx-cl" title="Close">${IC.x}</button>
      </div>
    </div>
    <div id="obx-msgs" role="log" aria-live="polite"></div>
    <div id="obx-bar">
      <div id="obx-input-row">
        <textarea id="obx-in" rows="1" placeholder="${ph}" autocomplete="off"></textarea>
        <div class="obx-bar-btns">
          <button class="obx-ib obx-mic" id="obx-mic" title="Voice input">${IC.mic}</button>
          <button class="obx-ib obx-upload-btn" id="obx-up" title="Upload">${IC.upload}</button>
          <button id="obx-send" title="Send">${IC.send}</button>
        </div>
      </div>
      <div id="obx-foot">Press Enter to send · Shift+Enter for newline</div>
    </div>
  </div>
</div>
<input type="file" id="obx-file-in" accept=".pdf,.txt,.md" style="display:none">`
  }

  // ─── Bind ─────────────────────────────────────────────────────────
  private bind(){
    const $=(id:string)=>this.root.querySelector('#'+id) as HTMLElement
    $('obx-btn').addEventListener('click',()=>this.open())
    $('obx-cl').addEventListener('click',()=>this.close())
    $('obx-hb').addEventListener('click',()=>this.togHist())
    $('obx-hx').addEventListener('click',()=>this.closeHist())
    $('obx-hist-bg').addEventListener('click',()=>this.closeHist())
    $('obx-new').addEventListener('click',()=>{this.newSession();this.closeHist()})
    $('obx-th').addEventListener('click',()=>this.togTheme())
    $('obx-fs').addEventListener('click',()=>this.togFs())
    $('obx-send').addEventListener('click',()=>this.send())
    $('obx-mic').addEventListener('click',()=>this.togVoice())
    $('obx-up').addEventListener('click',()=>($('obx-file-in') as HTMLInputElement).click())
    $('obx-file-in').addEventListener('change',(e:any)=>this.onFile(e))
    $('obx-doc-x')?.addEventListener('click',()=>this.clearDoc())
    const inp=$('obx-in') as HTMLTextAreaElement
    inp.addEventListener('keydown',(e:any)=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();this.send()}})
    inp.addEventListener('input',()=>{inp.style.height='auto';inp.style.height=Math.min(inp.scrollHeight,100)+'px'})
    // Drag
    $('obx-hd').addEventListener('mousedown',(e:any)=>this.dragStart(e))
    document.addEventListener('mousemove',(e:any)=>this.dragMove(e))
    document.addEventListener('mouseup',()=>this.dragEnd())
    // Resize
    $('obx-resize').addEventListener('mousedown',(e:any)=>this.resizeStart(e))
    document.addEventListener('mousemove',(e:any)=>this.resizeMove(e))
    document.addEventListener('mouseup',()=>this.resizeEnd())
    // Copy handler
    $('obx-msgs').addEventListener('click',(e:any)=>{
      if(this.histOpen)this.closeHist()
      const t=e.target
      if(t.classList?.contains('obx-pre-copy')){
        const code=safeDecode(t.getAttribute('data-code')||'')
        navigator.clipboard?.writeText(code)
        t.innerHTML=IC.check+' Copied'
        setTimeout(()=>{t.innerHTML='Copy'},2000)
      }
    })
  }

  private open(){const w=this.root.querySelector('#obx-win') as HTMLElement; w.hidden=false; this.isOpen=true; this.root.classList.add('open'); this.renderMsgs(); setTimeout(()=>(this.root.querySelector('#obx-in') as HTMLElement)?.focus(),120)}
  private close(){const w=this.root.querySelector('#obx-win') as HTMLElement; w.hidden=true; this.isOpen=false; this.root.classList.remove('open'); if(this.histOpen)this.closeHist()}
  private togHist(){this.histOpen?this.closeHist():this.openHist()}
  private openHist(){this.histOpen=true; this.root.querySelector('#obx-hist')?.classList.add('on'); this.renderHist()}
  private closeHist(){this.histOpen=false; this.root.querySelector('#obx-hist')?.classList.remove('on')}
  private renderHist(){
    const el=this.root.querySelector('#obx-sess')!
    el.innerHTML=this.sessions.map(s=>{
      const d=new Date(s.updatedAt).toLocaleDateString([],{month:'short',day:'numeric'})
      return `<div class="obx-si${s.id===this.sid?' act':''}" data-sid="${s.id}">
        <div class="obx-si-ic">💬</div>
        <div class="obx-si-tx">
          <div class="obx-si-t">${this.esc(s.title)}</div>
          <div class="obx-si-d">${d} · ${s.messages.length} msgs</div>
        </div>
        <button class="obx-si-del" data-sid="${s.id}">${IC.trash}</button>
      </div>`
    }).join('')
    el.querySelectorAll('.obx-si').forEach(el=>{
      el.addEventListener('click',(e:any)=>{
        if(e.target.closest('.obx-si-del'))return
        const id=(el as HTMLElement).dataset.sid!
        this.sid=id; this.api=new ChatApi(this.cfg.engineUrl,this.cfg.tenantId)
        this.renderMsgs(); this.closeHist()
      })
    })
    el.querySelectorAll('.obx-si-del').forEach(btn=>{
      btn.addEventListener('click',(e:any)=>{
        e.stopPropagation()
        const id=(btn as HTMLElement).dataset.sid!
        this.sessions=this.sessions.filter(s=>s.id!==id)
        if(!this.sessions.length)this.newSession(false)
        else if(this.sid===id){this.sid=this.sessions[0].id;this.api=new ChatApi(this.cfg.engineUrl,this.cfg.tenantId)}
        this.save(); this.renderMsgs(); this.renderHist()
      })
    })
  }
  private togTheme(){
    this.dark=!this.dark; this.root.setAttribute('data-theme',this.dark?'dark':'light')
    const b=this.root.querySelector('#obx-th')!; b.innerHTML=this.dark?IC.sun:IC.moon
    try{localStorage.setItem('obx_theme',this.dark?'dark':'light')}catch{}
  }
  private togFs(){this.fullscreen=!this.fullscreen; this.root.classList.toggle('fs',this.fullscreen); const b=this.root.querySelector('#obx-fs')!; b.innerHTML=this.fullscreen?IC.shrink:IC.expand}
  private dragStart(e:any){if(this.fullscreen)return; const w=this.root.querySelector('#obx-win') as HTMLElement; const r=w.getBoundingClientRect(); this.dragOn=true; w.classList.add('drag'); this.dx=e.clientX-r.left; this.dy=e.clientY-r.top}
  private dragMove(e:any){if(!this.dragOn)return; const w=this.root.querySelector('#obx-win') as HTMLElement; let x=Math.max(0,Math.min(e.clientX-this.dx,window.innerWidth-w.offsetWidth)); let y=Math.max(0,Math.min(e.clientY-this.dy,window.innerHeight-w.offsetHeight)); w.style.position='fixed'; w.style.left=x+'px'; w.style.top=y+'px'; w.style.right='auto'; w.style.bottom='auto'}
  private dragEnd(){this.dragOn=false; this.root.querySelector('#obx-win')?.classList.remove('drag')}
  private resizeStart(e:any){if(this.fullscreen)return; e.stopPropagation(); this.resizeOn=true; this.root.querySelector('#obx-win')?.classList.add('resize'); this.resizeX=e.clientX; this.resizeY=e.clientY}
  private resizeMove(e:any){if(!this.resizeOn)return; const w=this.root.querySelector('#obx-win') as HTMLElement; const dX=e.clientX-this.resizeX; const dY=e.clientY-this.resizeY; const rect=w.getBoundingClientRect(); const nW=Math.max(300,Math.min(w.offsetWidth+dX,window.innerWidth-Math.max(rect.left,20)-20)); const nH=Math.max(400,Math.min(w.offsetHeight+dY,window.innerHeight-rect.top-60)); w.style.width=nW+'px'; w.style.height=nH+'px'; this.resizeX=e.clientX; this.resizeY=e.clientY}
  private resizeEnd(){this.resizeOn=false; this.root.querySelector('#obx-win')?.classList.remove('resize')}
  private togVoice(){
    const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition
    if(!SR){alert('Voice input requires Chrome or Safari.');return}
    if(this.listening){this.recog?.stop();return}
    this.recog=new SR(); this.recog.lang='en-US'; this.recog.continuous=false; this.recog.interimResults=true
    const mb=this.root.querySelector('#obx-mic')!; const inp=this.root.querySelector('#obx-in') as HTMLTextAreaElement
    this.recog.onstart=()=>{this.listening=true;mb.classList.add('rec');mb.innerHTML=IC.micRec;inp.placeholder='Listening…'}
    this.recog.onresult=(e:any)=>{const t=Array.from(e.results).map((r:any)=>r[0].transcript).join(''); inp.value=t; inp.style.height='auto'; inp.style.height=Math.min(inp.scrollHeight,100)+'px'}
    this.recog.onend=()=>{this.listening=false;mb.classList.remove('rec');mb.innerHTML=IC.mic;inp.placeholder=this.cfg.placeholder||'Message…'}
    this.recog.onerror=()=>{this.listening=false;mb.classList.remove('rec');mb.innerHTML=IC.mic;inp.placeholder=this.cfg.placeholder||'Message…'}
    this.recog.start()
  }
  private async onFile(e:any){
    const file=e.target.files[0]; if(!file)return
    const badge=this.root.querySelector('#obx-doc-badge') as HTMLElement
    const nameEl=this.root.querySelector('#obx-doc-name') as HTMLElement
    const statusEl=this.root.querySelector('#obx-doc-status') as HTMLElement
    badge.classList.add('on'); nameEl.textContent=file.name; statusEl.textContent='Reading…'
    e.target.value=''
    try{
      const text=await this.readFile(file)
      statusEl.textContent='Sending…'
      const mcpUrl=(this.cfg as any).mcpServerUrl||'http://localhost:3002'
      const res=await fetch(`${mcpUrl}/tools/call`,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({toolName:'ingest_document',parameters:{filename:file.name,content:text}}),
      }).catch(()=>null)
      this.uploadedDoc=text.slice(0,6000)
      statusEl.textContent=res?.ok?'Ready ✓':'Indexed'
      this.appendSys(`📄 "${file.name}" loaded · Ask me about it`)
    }catch(err:any){statusEl.textContent='Error'}
  }
  private clearDoc(){this.uploadedDoc=null; const badge=this.root.querySelector('#obx-doc-badge'); if(badge)badge.classList.remove('on')}
  private async readFile(file:File):Promise<string>{return new Promise((res,rej)=>{const r=new FileReader(); r.onload=e=>res(e.target?.result as string); r.onerror=()=>rej(new Error('Failed')); r.readAsText(file)})}
  private appendSys(content:string){const c=this.root.querySelector('#obx-msgs')!; c.querySelector('.obx-empty')?.remove(); const el=document.createElement('div'); el.style.cssText='text-align:center;font-size:11px;color:var(--tx3);margin:8px 0;padding:6px 12px;background:var(--bg2);border-radius:10px'; el.textContent=content; c.appendChild(el); this.scrollBot()}
  private renderMsgs(){
    const c=this.root.querySelector('#obx-msgs')!; c.innerHTML=''
    const msgs=this.sess.messages
    if(!msgs.length){
      c.innerHTML=`<div class="obx-empty"><div class="obx-ei">${IC.sparkle}</div><div class="obx-et">Welcome! 👋</div><div class="obx-es">Ask me about weather, calculations, currencies, or upload a document!</div><div class="obx-chips"><button class="obx-chip" data-q="Weather in London">🌤 Weather</button><button class="obx-chip" data-q="Calculate 25% of 200">🧮 Math</button><button class="obx-chip" data-q="100 USD to EUR">💱 Currency</button></div></div>`
      c.querySelectorAll('.obx-chip').forEach(ch=>ch.addEventListener('click',()=>{const inp=this.root.querySelector('#obx-in') as HTMLTextAreaElement; inp.value=(ch as HTMLElement).dataset.q||''; this.send()}))
      return
    }
    let lastDate=''
    msgs.forEach(m=>{const d=new Date().toLocaleDateString([],{weekday:'long',month:'short',day:'numeric'}); if(d!==lastDate){lastDate=d;c.insertAdjacentHTML('beforeend',`<div class="obx-date"><span>${d}</span></div>`)} this.addBubble(m.role,m.content,m.time,false)})
    this.scrollBot()
  }
  private addBubble(role:'user'|'assistant',content:string,time?:string,save=true){
    const c=this.root.querySelector('#obx-msgs')!; c.querySelector('.obx-empty')?.remove()
    const t=time||this.ft(); const isU=role==='user'; const av=this.initials()[0]
    const row=document.createElement('div'); row.className=`obx-row ${isU?'obx-row-u':'obx-row-a'}`
    row.innerHTML=`<div class="obx-inner">${!isU?`<div class="obx-av-sm">${av}</div>`:''}<div class="obx-bbl">${isU?this.esc(content).replace(/\n/g,'<br>'):md(content)}</div></div><div class="obx-meta"><span class="obx-mt">${t}</span>${!isU?`<button class="obx-cp">${IC.copy}</button>`:''}</div>`
    row.querySelector('.obx-cp')?.addEventListener('click',()=>{navigator.clipboard?.writeText(content); const b=row.querySelector('.obx-cp')!; b.innerHTML=IC.check+' Copied'; setTimeout(()=>{b.innerHTML=IC.copy},2000)})
    c.appendChild(row)
    if(save){this.sess.messages.push({role,content,time:t}); this.sess.updatedAt=Date.now(); if(role==='user'&&this.sess.messages.filter(m=>m.role==='user').length===1) this.sess.title=content.slice(0,44)+(content.length>44?'…':''); this.save()}
    this.scrollBot(); return row
  }
  private addTyping(){const c=this.root.querySelector('#obx-msgs')!; c.querySelector('.obx-empty')?.remove(); const av=this.initials()[0]; const el=document.createElement('div'); el.className='obx-row obx-row-a'; el.id='obx-ty'; el.innerHTML=`<div class="obx-inner"><div class="obx-av-sm">${av}</div><div class="obx-bbl"><div class="obx-typing"><span></span><span></span><span></span></div></div></div>`; c.appendChild(el); this.scrollBot(); return el}
  private scrollBot(){const c=this.root.querySelector('#obx-msgs'); if(c)requestAnimationFrame(()=>{c.scrollTop=c.scrollHeight})}
  private async send(){
    if(this.streaming){this.abort?.abort();return}
    const inp=this.root.querySelector('#obx-in') as HTMLTextAreaElement
    let text=inp.value.trim(); if(!text)return
    const userMsg=text
    inp.value=''; inp.style.height='auto'
    if(this.uploadedDoc){text=`[Context: ${this.uploadedDoc.slice(0,2000)}]\n\n${text}`}
    this.addBubble('user',userMsg)
    const ty=this.addTyping(); this.setStream(true)
    let full=''; let first=true; this.abort=new AbortController()
    try{
      for await(const chunk of this.api.stream(text,this.abort.signal)){
        if(chunk.type==='text'){
          full+=chunk.content
          if(first){ty.remove();first=false;this.addBubble('assistant',full,undefined,false).id='obx-live'}
          else{const b=this.root.querySelector('#obx-live .obx-bbl');if(b)b.innerHTML=md(full)}
          this.scrollBot()
        }
      else if(chunk.type==='tool_call'){
          // Show tool calling indicator
          const toolMsg = `🔧 ${chunk.content}`;
          if(first){
            ty.remove();
            first=false;
            this.addBubble('assistant',toolMsg,undefined,false).id='obx-live';
          } else {
            const b=this.root.querySelector('#obx-live .obx-bbl');
            if(b) b.innerHTML = md(toolMsg);
          }
          full = ''; // Reset full text for tool response
          this.scrollBot();
        }
        else if(chunk.type==='tool_result'){
          // Tool result received - this will be followed by the actual AI response
          console.log('Tool result received:', chunk.toolResult);
          // Show a brief indicator that tool completed
          const toolResultMsg = `✅ Tool completed`;
          const b=this.root.querySelector('#obx-live .obx-bbl');
          if(b) b.innerHTML = md(toolResultMsg);
          this.scrollBot();
        }
        if(chunk.type==='done'||chunk.type==='error')break
      }
    }catch(e:any){if(e?.name!=='AbortError'){ty.remove();this.addBubble('assistant','Sorry, something went wrong. Please try again.','',false)}}
    ty.remove()
    const live=this.root.querySelector('#obx-live')
    if(live){live.removeAttribute('id');if(full){this.sess.messages.push({role:'assistant',content:full,time:this.ft()});this.sess.updatedAt=Date.now();this.save()}}
    this.setStream(false); this.abort=null; setTimeout(()=>(this.root.querySelector('#obx-in') as HTMLElement)?.focus(),50)
  }
  private setStream(on:boolean){
    this.streaming=on
    const btn=this.root.querySelector('#obx-send')!; const st=this.root.querySelector('#obx-st')
    btn.innerHTML=on?IC.stop:IC.send; btn.classList.toggle('stop',on)
    if(st)st.innerHTML=on?'<span class="obx-dot" style="background:#f59e0b"></span>Thinking…':'<span class="obx-dot"></span>Online'
  }
}