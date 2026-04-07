import type { WidgetConfig } from './types'
import { ChatApi } from './api'

// ─── Icon library (Feather-style, crisp strokes) ─────────────────
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
}

// ─── Markdown renderer ────────────────────────────────────────────
function md(raw: string): string {
  let s = raw.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  s = s.replace(/```(\w*)\n?([\s\S]*?)```/g, (_,l,c) =>
    `<div class="obx-pre"><div class="obx-pre-bar"><span class="obx-lang">${l||'code'}</span><button class="obx-pre-copy" onclick="navigator.clipboard?.writeText(this.nextElementSibling?.textContent||'')">Copy</button></div><code>${c.trim()}</code></div>`)
  s = s.replace(/\x60([^\x60\n]+)\x60/g,'<code class="obx-ic">$1</code>')
  s = s.replace(/^\|(.+)\|\r?\n\|[-:| ]+\|\r?\n((?:\|.+\|\r?\n?)+)/gm,(_,h,b)=>{
    const ths=h.split('|').filter((x:string)=>x.trim()).map((x:string)=>`<th>${x.trim()}</th>`).join('')
    const rows=b.trim().split('\n').map((r:string)=>'<tr>'+r.split('|').filter((x:string)=>x.trim()).map((x:string)=>`<td>${x.trim()}</td>`).join('')+'</tr>').join('')
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
    if(/^<(h[1-6]|ul|ol|div|table|blockquote|hr|pre)/.test(t)) return t
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

  constructor(cfg:WidgetConfig){
    this.cfg=cfg
    try{this.dark=localStorage.getItem('obx_theme')==='dark'||(localStorage.getItem('obx_theme')==null&&window.matchMedia('(prefers-color-scheme:dark)').matches)}
    catch{this.dark=false}
    this.loadSessions()
  }

  private loadSessions(){
    try{this.sessions=JSON.parse(localStorage.getItem('obx_sessions')||'[]')}catch{this.sessions=[]}
    if(!this.sessions.length)this.newSession(false)
    else this.sid=this.sessions[0].id
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

  // ─── CSS (premium redesign) ─────────────────────────────────────
  private css(){
    const p=this.cfg.primaryColor||'#6C5CE7'
    const right=this.cfg.position!=='bottom-left'
    return `
#obx,#obx *,#obx *::before,#obx *::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased}
#obx{position:fixed;${right?'right:24px':'left:24px'};bottom:24px;z-index:2147483646;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;font-size:14px;
  --p:${p};--p15:color-mix(in srgb,${p} 15%,transparent);--p20:color-mix(in srgb,${p} 20%,transparent);
  --bg:#fff;--bg2:#f7f7f8;--bg3:#eeeef0;--bg4:#e5e5e7;
  --bd:rgba(0,0,0,.08);--bd2:rgba(0,0,0,.12);
  --tx:#111;--tx2:#555;--tx3:#aaa;
  --shadow:0 2px 8px rgba(0,0,0,.06),0 16px 48px rgba(0,0,0,.12),0 4px 16px rgba(0,0,0,.08);
  --r:24px;--t:.2s;
}
#obx[data-theme=dark]{
  --bg:#18181b;--bg2:#27272a;--bg3:#3f3f46;--bg4:#52525b;
  --bd:rgba(255,255,255,.06);--bd2:rgba(255,255,255,.1);
  --tx:#fafafa;--tx2:#a1a1aa;--tx3:#71717a;
  --shadow:0 2px 8px rgba(0,0,0,.3),0 16px 48px rgba(0,0,0,.6);
}

/* ─── Launcher ─── */
#obx-btn{
  width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;
  background:var(--p);color:#fff;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 12px rgba(0,0,0,.15),0 8px 24px color-mix(in srgb,var(--p) 40%,transparent);
  transition:transform var(--t) cubic-bezier(.34,1.56,.64,1),box-shadow var(--t),opacity .25s;
  position:relative;
}
#obx-btn:hover{transform:scale(1.08);box-shadow:0 6px 20px rgba(0,0,0,.2),0 12px 32px color-mix(in srgb,var(--p) 50%,transparent)}
#obx-btn:active{transform:scale(.94)}
#obx-btn svg{width:27px;height:27px}
#obx-badge{position:absolute;top:-2px;right:-2px;min-width:20px;height:20px;padding:0 5px;
  background:#ff3b30;border:2px solid white;border-radius:10px;
  font-size:10px;font-weight:700;color:#fff;display:none;align-items:center;justify-content:center}
#obx.open #obx-btn{opacity:0;pointer-events:none;transform:scale(.7) translateY(6px)}

/* ─── Window ─── */
#obx-win{
  position:absolute;${right?'right:0':'left:0'};bottom:76px;
  width:420px;height:640px;
  background:var(--bg);
  border-radius:var(--r);
  box-shadow:var(--shadow);
  border:1px solid var(--bd);
  display:flex;overflow:hidden;
  transform-origin:${right?'bottom right':'bottom left'};
  animation:obx-open .28s cubic-bezier(.32,1.12,.64,1);
}
#obx-win[hidden]{display:none}
@keyframes obx-open{from{opacity:0;transform:scale(.88) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
#obx-win.drag{transition:none;animation:none}

/* ─── History panel (absolute overlay) ─── */
#obx-hist{
  position:absolute;inset:0 auto 0 0;
  width:0;overflow:hidden;
  background:var(--bg);
  display:flex;flex-direction:column;
  z-index:20;
  border-radius:var(--r) 0 0 var(--r);
  border-right:1px solid var(--bd);
  transition:width .26s cubic-bezier(.4,0,.2,1);
  box-shadow:none;
}
#obx-hist.on{width:300px;box-shadow:8px 0 32px rgba(0,0,0,.12)}
/* close-hist-overlay — click outside to close */
#obx-hist-bg{display:none;position:absolute;inset:0;z-index:19;background:rgba(0,0,0,.2);border-radius:var(--r)}
#obx-hist.on ~ #obx-hist-bg{display:block}

#obx-hist-hd{
  height:64px;display:flex;align-items:center;justify-content:space-between;
  padding:0 16px;border-bottom:1px solid var(--bd);flex-shrink:0;
  background:var(--bg);
}
.obx-hist-logo{display:flex;align-items:center;gap:10px}
.obx-hist-av{width:36px;height:36px;border-radius:50%;
  background:linear-gradient(135deg,var(--p),color-mix(in srgb,var(--p) 60%,#000));
  display:flex;align-items:center;justify-content:center;
  font-weight:700;font-size:13px;color:#fff;letter-spacing:.03em;flex-shrink:0}
.obx-hist-lbl{font-size:15px;font-weight:600;color:var(--tx)}
.obx-hist-sub{font-size:11px;color:var(--tx3);margin-top:1px}

.obx-new-btn{
  display:flex;align-items:center;gap:7px;
  margin:12px;padding:10px 14px;
  background:var(--p);color:#fff;border:none;border-radius:14px;
  cursor:pointer;font-size:13px;font-weight:500;font-family:inherit;
  transition:opacity .15s,transform .1s;flex-shrink:0;
}
.obx-new-btn svg{width:15px;height:15px;stroke:#fff}
.obx-new-btn:hover{opacity:.9}
.obx-new-btn:active{transform:scale(.97)}

#obx-sess{flex:1;overflow-y:auto;padding:6px 8px 16px}
#obx-sess::-webkit-scrollbar{width:3px}
#obx-sess::-webkit-scrollbar-thumb{background:var(--bd2);border-radius:2px}

.obx-si{
  display:flex;align-items:center;gap:10px;
  padding:10px 10px;border-radius:14px;cursor:pointer;
  transition:background .15s;margin-bottom:3px;
}
.obx-si:hover{background:var(--bg2)}
.obx-si.act{background:var(--p15)}
.obx-si-ic{width:34px;height:34px;border-radius:10px;background:var(--bg3);
  display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
.obx-si-tx{flex:1;min-width:0}
.obx-si-t{font-size:13px;font-weight:500;color:var(--tx);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.obx-si.act .obx-si-t{color:var(--p)}
.obx-si-d{font-size:11px;color:var(--tx3);margin-top:2px}
.obx-si-del{background:none;border:none;cursor:pointer;color:var(--tx3);
  padding:4px;border-radius:7px;display:flex;opacity:0;transition:opacity .15s;flex-shrink:0}
.obx-si-del svg{width:13px;height:13px}
.obx-si:hover .obx-si-del{opacity:1}
.obx-si-del:hover{color:#ff3b30;background:rgba(255,59,48,.1)}

/* ─── Main chat ─── */
#obx-main{flex:1;display:flex;flex-direction:column;min-width:0;position:relative}

/* ─── Header ─── */
#obx-hd{
  height:64px;display:flex;align-items:center;gap:8px;
  padding:0 10px 0 14px;
  border-bottom:1px solid var(--bd);
  background:var(--bg);flex-shrink:0;
  cursor:grab;user-select:none;
}
#obx-win.drag #obx-hd{cursor:grabbing}
.obx-hd-av{width:38px;height:38px;border-radius:50%;flex-shrink:0;
  background:linear-gradient(135deg,var(--p),color-mix(in srgb,var(--p) 55%,#000));
  display:flex;align-items:center;justify-content:center;
  font-weight:700;font-size:14px;color:#fff;letter-spacing:.02em}
.obx-hd-info{flex:1;min-width:0}
.obx-hd-name{font-size:15px;font-weight:600;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.obx-hd-st{font-size:11px;color:var(--tx3);display:flex;align-items:center;gap:5px;margin-top:2px}
.obx-dot{width:7px;height:7px;border-radius:50%;background:#22c55e;flex-shrink:0;
  animation:obx-pulse 2.5s infinite;box-shadow:0 0 0 0 rgba(34,197,94,.4)}
@keyframes obx-pulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.4)}60%{box-shadow:0 0 0 5px rgba(34,197,94,0)}}
.obx-acts{display:flex;gap:2px}

.obx-ib{width:34px;height:34px;border-radius:9px;background:none;border:none;
  cursor:pointer;color:var(--tx2);display:flex;align-items:center;justify-content:center;
  transition:background .12s,color .12s,transform .1s;flex-shrink:0}
.obx-ib svg{width:17px;height:17px}
.obx-ib:hover{background:var(--bg3);color:var(--tx)}
.obx-ib:active{transform:scale(.88)}

/* ─── Messages ─── */
#obx-msgs{flex:1;overflow-y:auto;padding:20px 16px;display:flex;flex-direction:column;gap:4px;scroll-behavior:smooth}
#obx-msgs::-webkit-scrollbar{width:4px}
#obx-msgs::-webkit-scrollbar-thumb{background:var(--bd2);border-radius:2px}

.obx-date{text-align:center;margin:16px 0 8px;user-select:none}
.obx-date span{font-size:11px;color:var(--tx3);background:var(--bg2);
  padding:4px 14px;border-radius:20px;border:1px solid var(--bd)}

/* Rows */
.obx-row{display:flex;flex-direction:column;margin-bottom:4px}
.obx-row-u{align-items:flex-end}
.obx-row-a{align-items:flex-start}
.obx-row-u+.obx-row-u,.obx-row-a+.obx-row-a{margin-top:-2px}

.obx-inner{display:flex;align-items:flex-end;gap:8px;max-width:88%}
.obx-row-u .obx-inner{flex-direction:row-reverse}
.obx-av-sm{width:28px;height:28px;border-radius:50%;flex-shrink:0;
  background:linear-gradient(135deg,var(--p),color-mix(in srgb,var(--p) 55%,#000));
  display:flex;align-items:center;justify-content:center;
  font-size:10px;font-weight:700;color:#fff;margin-bottom:2px}

/* Bubbles - Messenger style */
.obx-bbl{
  padding:10px 14px;font-size:14px;line-height:1.65;
  word-break:break-word;overflow-wrap:break-word;
}
.obx-row-u .obx-bbl{
  background:var(--p);color:#fff;
  border-radius:20px 20px 6px 20px;
}
.obx-row-a .obx-bbl{
  background:var(--bg2);color:var(--tx);
  border:1px solid var(--bd);
  border-radius:20px 20px 20px 6px;
}
/* Consecutive - no tail */
.obx-row-u:has(+ .obx-row-u) .obx-bbl{border-radius:20px}
.obx-row-a:has(+ .obx-row-a) .obx-bbl{border-radius:20px}

/* Markdown in bubbles */
.obx-bbl p{margin:0 0 8px}.obx-bbl p:last-child{margin-bottom:0}
.obx-bbl h1,.obx-bbl h2,.obx-bbl h3,.obx-bbl h4{font-weight:600;margin:10px 0 5px}
.obx-bbl h1{font-size:16px}.obx-bbl h2{font-size:15px}.obx-bbl h3,.obx-bbl h4{font-size:14px}
.obx-bbl ul,.obx-bbl ol{padding-left:20px;margin:5px 0 8px}
.obx-bbl li{margin-bottom:4px;padding-left:2px}
.obx-bbl ul{list-style:disc}.obx-bbl ol{list-style:decimal}
.obx-bbl strong{font-weight:600}.obx-bbl em{font-style:italic}.obx-bbl del{text-decoration:line-through;opacity:.6}
.obx-bbl a{color:var(--p);text-decoration:underline;text-underline-offset:2px}
.obx-row-u .obx-bbl a{color:rgba(255,255,255,.85)}
.obx-ic{font-family:"SF Mono",Menlo,Consolas,monospace;font-size:12px;background:rgba(0,0,0,.1);padding:2px 6px;border-radius:5px}
.obx-row-u .obx-ic{background:rgba(255,255,255,.2)}
.obx-pre{background:#1a1b26;border-radius:12px;margin:8px 0;overflow:hidden;border:1px solid rgba(255,255,255,.06)}
.obx-pre-bar{display:flex;align-items:center;justify-content:space-between;padding:8px 14px 6px;border-bottom:1px solid rgba(255,255,255,.06)}
.obx-lang{font-size:11px;color:#7c7f9e;font-family:"SF Mono",Menlo,monospace;font-weight:500}
.obx-pre-copy{background:rgba(255,255,255,.07);border:none;color:#9ca3af;font-size:11px;padding:3px 10px;border-radius:5px;cursor:pointer;font-family:inherit}
.obx-pre-copy:hover{background:rgba(255,255,255,.12);color:#fff}
.obx-pre code{display:block;padding:12px 14px;color:#cdd6f4;font-family:"SF Mono",Menlo,Consolas,monospace;font-size:12px;line-height:1.6;overflow-x:auto;white-space:pre}
.obx-tbl-w{overflow-x:auto;margin:8px 0}
.obx-tbl{border-collapse:collapse;width:100%;font-size:13px}
.obx-tbl th{background:rgba(0,0,0,.06);font-weight:600;text-align:left}
.obx-tbl th,.obx-tbl td{padding:8px 12px;border:1px solid var(--bd2)}
.obx-row-u .obx-tbl th{background:rgba(255,255,255,.15)}
.obx-row-u .obx-tbl th,.obx-row-u .obx-tbl td{border-color:rgba(255,255,255,.2)}
.obx-bbl blockquote{border-left:3px solid var(--p);padding-left:12px;color:var(--tx2);font-style:italic;margin:6px 0}
.obx-row-u .obx-bbl blockquote{border-left-color:rgba(255,255,255,.5);color:rgba(255,255,255,.8)}
.obx-bbl hr{border:none;border-top:1px solid var(--bd);margin:10px 0}

/* Meta row */
.obx-meta{display:flex;align-items:center;gap:8px;padding:4px 6px;min-height:24px}
.obx-row-a .obx-meta{padding-left:36px}
.obx-mt{font-size:10px;color:var(--tx3)}
.obx-cp{background:none;border:none;cursor:pointer;color:var(--tx3);
  padding:2px 7px;border-radius:6px;display:flex;align-items:center;gap:3px;
  font-size:11px;font-family:inherit;opacity:0;transition:opacity .15s,color .12s}
.obx-cp svg{width:12px;height:12px}
.obx-row-a:hover .obx-cp{opacity:1}
.obx-cp:hover{color:var(--p);background:var(--bg3)}

/* Typing indicator */
.obx-typing{display:flex;align-items:center;gap:5px;padding:4px 0}
.obx-typing span{width:7px;height:7px;background:var(--tx3);border-radius:50%;display:block;
  animation:obx-bb 1.2s infinite ease-in-out}
.obx-typing span:nth-child(2){animation-delay:.18s}
.obx-typing span:nth-child(3){animation-delay:.36s}
@keyframes obx-bb{0%,80%,100%{transform:scale(.55);opacity:.35}40%{transform:scale(1);opacity:1}}

/* Empty state */
.obx-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
  text-align:center;padding:32px 20px;gap:14px;color:var(--tx3)}
.obx-ei{width:60px;height:60px;border-radius:20px;
  background:linear-gradient(135deg,var(--p),color-mix(in srgb,var(--p) 55%,#1a0a6b));
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 16px color-mix(in srgb,var(--p) 35%,transparent)}
.obx-ei svg{width:28px;height:28px;stroke:#fff}
.obx-et{font-size:17px;font-weight:700;color:var(--tx);letter-spacing:-.02em}
.obx-es{font-size:13px;line-height:1.6;max-width:280px;color:var(--tx2)}
.obx-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:6px}
.obx-chip{background:var(--bg2);border:1px solid var(--bd2);color:var(--tx2);font-size:12px;
  font-family:inherit;padding:7px 14px;border-radius:20px;cursor:pointer;
  transition:all .15s;white-space:nowrap;display:flex;align-items:center;gap:5px}
.obx-chip:hover{background:var(--p15);border-color:var(--p);color:var(--p)}

/* ─── Input bar ─── */
#obx-bar{border-top:1px solid var(--bd);background:var(--bg);flex-shrink:0;padding:12px}
#obx-input-row{display:flex;align-items:flex-end;gap:8px}
#obx-in{flex:1;border:1.5px solid var(--bd2);border-radius:22px;
  padding:10px 16px;background:var(--bg2);color:var(--tx);
  font-size:14px;font-family:inherit;resize:none;outline:none;
  max-height:130px;overflow-y:auto;line-height:1.55;
  transition:border-color .15s,background .15s,box-shadow .15s}
#obx-in::placeholder{color:var(--tx3)}
#obx-in:focus{border-color:var(--p);background:var(--bg);box-shadow:0 0 0 4px var(--p15)}
.obx-bar-btns{display:flex;align-items:center;gap:4px}
.obx-mic{color:var(--tx3)}
.obx-mic.rec{color:var(--p);background:var(--p15);animation:obx-mic-pulse .9s infinite alternate}
@keyframes obx-mic-pulse{from{box-shadow:0 0 0 0 var(--p15)}to{box-shadow:0 0 0 6px transparent}}
.obx-upload-btn{color:var(--tx3)}
#obx-send{width:40px;height:40px;flex-shrink:0;border-radius:50%;
  background:var(--p);color:#fff;border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 2px 8px color-mix(in srgb,var(--p) 40%,transparent);
  transition:transform .12s,opacity .12s,background .18s}
#obx-send svg{width:16px;height:16px}
#obx-send:hover{opacity:.9;transform:scale(1.06)}
#obx-send:active{transform:scale(.92)}
#obx-send.stop{background:#ff3b30;box-shadow:0 2px 8px rgba(255,59,48,.4)}
#obx-foot{font-size:10px;color:var(--tx3);text-align:center;margin-top:8px}

/* PDF upload indicator */
#obx-doc-badge{display:none;align-items:center;gap:8px;
  background:var(--bg2);border:1px solid var(--bd);border-radius:10px;
  padding:8px 12px;margin-top:8px;font-size:12px;color:var(--tx2)}
#obx-doc-badge.on{display:flex}
.obx-doc-name{flex:1;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.obx-doc-x{background:none;border:none;cursor:pointer;color:var(--tx3);padding:0;
  display:flex;align-items:center}
.obx-doc-x svg{width:14px;height:14px}
.obx-doc-status{font-size:11px;color:var(--tx3)}

/* Fullpage */
#obx[data-mode=fullpage] #obx-btn{display:none}
#obx[data-mode=fullpage] #obx-win,#obx.fs #obx-win{
  position:fixed;inset:0;width:100%!important;height:100%!important;
  border-radius:0;bottom:0!important;right:0!important;left:0!important;top:0!important;
  border:none;animation:none}
#obx.fs #obx-hist{border-radius:0}
@media(max-width:460px){#obx-win{width:calc(100vw - 16px)!important}}
`
  }

  // ─── Mount ───────────────────────────────────────────────────────
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

  <!-- History overlay -->
  <div id="obx-hist">
    <div id="obx-hist-hd">
      <div class="obx-hist-logo">
        <div class="obx-hist-av">${av}</div>
        <div><div class="obx-hist-lbl">${this.esc(title)}</div><div class="obx-hist-sub">Chat history</div></div>
      </div>
      <button class="obx-ib" id="obx-hx" title="Close">${IC.x}</button>
    </div>
    <button class="obx-new-btn" id="obx-new">${IC.plus} New conversation</button>
    <div id="obx-sess"></div>
  </div>
  <div id="obx-hist-bg"></div>

  <!-- Main chat -->
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
        <textarea id="obx-in" rows="1" placeholder="${ph}" autocomplete="off" aria-label="Message input"></textarea>
        <div class="obx-bar-btns">
          <button class="obx-ib obx-mic" id="obx-mic" title="Voice input">${IC.mic}</button>
          <button class="obx-ib obx-upload-btn" id="obx-up" title="Upload PDF">${IC.upload}</button>
          <button id="obx-send" title="Send">${IC.send}</button>
        </div>
      </div>
      <div id="obx-doc-badge">
        <span>📄</span><span class="obx-doc-name" id="obx-doc-name">—</span>
        <span class="obx-doc-status" id="obx-doc-status">Indexing…</span>
        <button class="obx-doc-x" id="obx-doc-x" title="Remove">${IC.x}</button>
      </div>
      <div id="obx-foot">Orbinex AI · Enter to send · Shift+Enter for newline</div>
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
    $('obx-doc-x').addEventListener('click',()=>this.clearDoc())
    const inp=$('obx-in') as HTMLTextAreaElement
    inp.addEventListener('keydown',(e:any)=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();this.send()}})
    inp.addEventListener('input',()=>{inp.style.height='auto';inp.style.height=Math.min(inp.scrollHeight,130)+'px'})
    // Drag
    $('obx-hd').addEventListener('mousedown',(e:any)=>this.dragStart(e))
    document.addEventListener('mousemove',(e:any)=>this.dragMove(e))
    document.addEventListener('mouseup',()=>this.dragEnd())
    $('obx-hd').addEventListener('touchstart',(e:any)=>this.dragStart(e.touches[0]),{passive:true})
    document.addEventListener('touchmove',(e:any)=>this.dragMove(e.touches[0]),{passive:true})
    document.addEventListener('touchend',()=>this.dragEnd())
    // Click messages → close history
    $('obx-msgs').addEventListener('click',()=>{if(this.histOpen)this.closeHist()})
  }

  // ─── Open / Close ─────────────────────────────────────────────────
  private open(){
    this.newSession()
    const w=this.root.querySelector('#obx-win') as HTMLElement
    w.hidden=false; this.isOpen=true
    this.root.classList.add('open')
    this.root.querySelector('#obx-btn')?.setAttribute('aria-expanded','true')
    this.renderMsgs()
    setTimeout(()=>(this.root.querySelector('#obx-in') as HTMLElement)?.focus(),120)
  }
  private close(){
    const w=this.root.querySelector('#obx-win') as HTMLElement
    w.hidden=true; this.isOpen=false
    this.root.classList.remove('open')
    if(this.histOpen)this.closeHist()
  }

  // ─── History ──────────────────────────────────────────────────────
  private togHist(){this.histOpen?this.closeHist():this.openHist()}
  private openHist(){
    this.histOpen=true
    this.root.querySelector('#obx-hist')?.classList.add('on')
    this.renderHist()
  }
  private closeHist(){
    this.histOpen=false
    this.root.querySelector('#obx-hist')?.classList.remove('on')
  }
  private renderHist(){
    const el=this.root.querySelector('#obx-sess')!
    el.innerHTML=this.sessions.map(s=>{
      const d=new Date(s.updatedAt).toLocaleDateString([],{month:'short',day:'numeric'})
      return `<div class="obx-si${s.id===this.sid?' act':''}" data-sid="${s.id}">
        <div class="obx-si-ic">💬</div>
        <div class="obx-si-tx">
          <div class="obx-si-t">${this.esc(s.title)}</div>
          <div class="obx-si-d">${d} · ${s.messages.length} messages</div>
        </div>
        <button class="obx-si-del" data-sid="${s.id}" title="Delete">${IC.trash}</button>
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

  // ─── Theme ────────────────────────────────────────────────────────
  private togTheme(){
    this.dark=!this.dark
    this.root.setAttribute('data-theme',this.dark?'dark':'light')
    const b=this.root.querySelector('#obx-th')!; b.innerHTML=this.dark?IC.sun:IC.moon
    try{localStorage.setItem('obx_theme',this.dark?'dark':'light')}catch{}
  }

  // ─── Fullscreen ───────────────────────────────────────────────────
  private togFs(){
    this.fullscreen=!this.fullscreen
    this.root.classList.toggle('fs',this.fullscreen)
    const b=this.root.querySelector('#obx-fs')!
    b.innerHTML=this.fullscreen?IC.shrink:IC.expand
  }

  // ─── Drag ─────────────────────────────────────────────────────────
  private dragStart(e:any){
    if(this.fullscreen)return
    const w=this.root.querySelector('#obx-win') as HTMLElement
    const r=w.getBoundingClientRect()
    this.dragOn=true; w.classList.add('drag')
    this.dx=e.clientX-r.left; this.dy=e.clientY-r.top
  }
  private dragMove(e:any){
    if(!this.dragOn)return
    const w=this.root.querySelector('#obx-win') as HTMLElement
    let x=Math.max(0,Math.min(e.clientX-this.dx,window.innerWidth-w.offsetWidth))
    let y=Math.max(0,Math.min(e.clientY-this.dy,window.innerHeight-w.offsetHeight))
    w.style.cssText+=`;position:fixed;left:${x}px;top:${y}px;right:auto;bottom:auto`
  }
  private dragEnd(){this.dragOn=false;this.root.querySelector('#obx-win')?.classList.remove('drag')}

  // ─── Voice ────────────────────────────────────────────────────────
  private togVoice(){
    const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition
    if(!SR){alert('Voice input requires Chrome or Safari.');return}
    if(this.listening){this.recog?.stop();return}
    this.recog=new SR(); this.recog.lang='en-US'; this.recog.continuous=false; this.recog.interimResults=true
    const mb=this.root.querySelector('#obx-mic')!
    const inp=this.root.querySelector('#obx-in') as HTMLTextAreaElement
    this.recog.onstart=()=>{this.listening=true;mb.classList.add('rec');mb.innerHTML=IC.micRec;inp.placeholder='Listening…'}
    this.recog.onresult=(e:any)=>{
      const t=Array.from(e.results).map((r:any)=>r[0].transcript).join('')
      inp.value=t; inp.style.height='auto'; inp.style.height=Math.min(inp.scrollHeight,130)+'px'
    }
    this.recog.onend=()=>{this.listening=false;mb.classList.remove('rec');mb.innerHTML=IC.mic;inp.placeholder=this.cfg.placeholder||'Message…'}
    this.recog.onerror=()=>{this.listening=false;mb.classList.remove('rec');mb.innerHTML=IC.mic;inp.placeholder=this.cfg.placeholder||'Message…'}
    this.recog.start()
  }

  // ─── File / PDF upload → sends to MCP RAG endpoint ───────────────
  private uploadedDoc:string|null=null
  private async onFile(e:any){
    const file:File=e.target.files[0]; if(!file)return
    const badge=this.root.querySelector('#obx-doc-badge') as HTMLElement
    const nameEl=this.root.querySelector('#obx-doc-name') as HTMLElement
    const statusEl=this.root.querySelector('#obx-doc-status') as HTMLElement
    badge.classList.add('on'); nameEl.textContent=file.name; statusEl.textContent='Reading…'
    e.target.value=''
    try{
      const text=await this.readFile(file)
      statusEl.textContent='Sending to RAG…'
      // Send to MCP rebuild endpoint with the text
      const mcpUrl=(this.cfg as any).mcpServerUrl||'http://localhost:3002'
      const res=await fetch(`${mcpUrl}/tools/call`,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({toolName:'ingest_document',parameters:{filename:file.name,content:text}}),
      }).catch(()=>null)
      this.uploadedDoc=text.slice(0,6000) // keep context snippet
      statusEl.textContent=res?.ok?'Ready ✓':'Saved locally ✓'
      // Also inject as context in next message
      this.appendSys(`📄 Document "${file.name}" loaded (${Math.round(text.length/1000)}K chars). Ask me questions about it.`)
    }catch(err:any){statusEl.textContent='Error: '+err.message}
  }
  private clearDoc(){
    this.uploadedDoc=null
    const badge=this.root.querySelector('#obx-doc-badge') as HTMLElement
    badge.classList.remove('on')
  }
  private async readFile(file:File):Promise<string>{
    return new Promise((res,rej)=>{
      const r=new FileReader()
      r.onload=e=>res(e.target?.result as string)
      r.onerror=()=>rej(new Error('Failed to read file'))
      if(file.type==='application/pdf'){
        // For PDF: read as text (works for text-based PDFs)
        r.readAsText(file)
      } else {
        r.readAsText(file)
      }
    })
  }
  private appendSys(content:string){
    const c=this.root.querySelector('#obx-msgs')!; c.querySelector('.obx-empty')?.remove()
    const el=document.createElement('div'); el.className='obx-sys-msg'
    el.style.cssText='text-align:center;font-size:11px;color:var(--tx3);margin:8px 0;padding:6px 12px;background:var(--bg2);border-radius:10px;border:1px solid var(--bd)'
    el.textContent=content; c.appendChild(el); this.scrollBot()
  }

  // ─── Render messages ──────────────────────────────────────────────
  private renderMsgs(){
    const c=this.root.querySelector('#obx-msgs')!; c.innerHTML=''
    const msgs=this.sess.messages
    if(!msgs.length){
      c.innerHTML=`<div class="obx-empty">
        <div class="obx-ei">${IC.sparkle}</div>
        <div class="obx-et">Hi there! 👋</div>
        <div class="obx-es">I'm your AI assistant. I can answer questions, use tools, search documents, and more.</div>
        <div class="obx-chips">
          <button class="obx-chip" data-q="What's the weather in Mumbai?">🌤 Weather</button>
          <button class="obx-chip" data-q="Calculate 15% of 2500">🧮 Calculate</button>
          <button class="obx-chip" data-q="Convert 100 USD to INR">💱 Currency</button>
          <button class="obx-chip" data-q="Tell me about Paris">🌍 City guide</button>
          <button class="obx-chip" data-q="What time is it in Tokyo?">🕐 Time zones</button>
          <button class="obx-chip" data-q="Latest AI news">📰 News</button>
        </div>
      </div>`
      c.querySelectorAll('.obx-chip').forEach(ch=>ch.addEventListener('click',()=>{
        const inp=this.root.querySelector('#obx-in') as HTMLTextAreaElement
        inp.value=(ch as HTMLElement).dataset.q||''; this.send()
      }))
      return
    }
    let lastDate=''
    msgs.forEach(m=>{
      const d=new Date().toLocaleDateString([],{weekday:'long',month:'short',day:'numeric'})
      if(d!==lastDate){lastDate=d;c.insertAdjacentHTML('beforeend',`<div class="obx-date"><span>${d}</span></div>`)}
      this.addBubble(m.role,m.content,m.time,false)
    })
    this.scrollBot()
  }

  private addBubble(role:'user'|'assistant',content:string,time?:string,save=true):HTMLElement{
    const c=this.root.querySelector('#obx-msgs')!; c.querySelector('.obx-empty')?.remove()
    const t=time||this.ft(); const isU=role==='user'
    const av=this.initials()[0]
    const row=document.createElement('div'); row.className=`obx-row ${isU?'obx-row-u':'obx-row-a'}`
    row.innerHTML=`
    <div class="obx-inner">
      ${!isU?`<div class="obx-av-sm">${av}</div>`:''}
      <div class="obx-bbl">${isU?this.esc(content).replace(/\n/g,'<br>'):md(content)}</div>
    </div>
    <div class="obx-meta">
      <span class="obx-mt">${t}</span>
      ${!isU?`<button class="obx-cp" title="Copy">${IC.copy} Copy</button>`:''}
    </div>`
    row.querySelector('.obx-cp')?.addEventListener('click',()=>{
      navigator.clipboard?.writeText(content).catch(()=>{})
      const b=row.querySelector('.obx-cp')!; b.innerHTML=IC.check+' Copied'
      setTimeout(()=>{b.innerHTML=IC.copy+' Copy'},1800)
    })
    c.appendChild(row)
    if(save){
      this.sess.messages.push({role,content,time:t}); this.sess.updatedAt=Date.now()
      if(role==='user'&&this.sess.messages.filter(m=>m.role==='user').length===1)
        this.sess.title=content.slice(0,44)+(content.length>44?'…':'')
      this.save()
    }
    this.scrollBot(); return row
  }

  private addTyping():HTMLElement{
    const c=this.root.querySelector('#obx-msgs')!; c.querySelector('.obx-empty')?.remove()
    const av=this.initials()[0]; const el=document.createElement('div')
    el.className='obx-row obx-row-a'; el.id='obx-ty'
    el.innerHTML=`<div class="obx-inner"><div class="obx-av-sm">${av}</div><div class="obx-bbl"><div class="obx-typing"><span></span><span></span><span></span></div></div></div>`
    c.appendChild(el); this.scrollBot(); return el
  }

  private scrollBot(){const c=this.root.querySelector('#obx-msgs');if(c)requestAnimationFrame(()=>{c.scrollTop=c.scrollHeight})}

  // ─── Send ─────────────────────────────────────────────────────────
  private async send(){
    if(this.streaming){this.abort?.abort();return}
    const inp=this.root.querySelector('#obx-in') as HTMLTextAreaElement
    let text=inp.value.trim(); if(!text)return
    inp.value=''; inp.style.height='auto'
    // If doc loaded, prepend context note
    if(this.uploadedDoc){
      text=`[Context from uploaded document]\n${this.uploadedDoc.slice(0,3000)}\n\n[User question] ${text}`
    }
    this.addBubble('user',inp.value.trim()||text.split('[User question] ').pop()||text)
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
        if(chunk.type==='done'||chunk.type==='error')break
      }
    }catch(e:any){if(e?.name!=='AbortError'){ty.remove();this.addBubble('assistant',`⚠ ${e.message}`)}}
    ty.remove()
    const live=this.root.querySelector('#obx-live')
    if(live){live.removeAttribute('id');if(full){this.sess.messages.push({role:'assistant',content:full,time:this.ft()});this.sess.updatedAt=Date.now();this.save()}}
    this.setStream(false); this.abort=null; setTimeout(()=>(this.root.querySelector('#obx-in') as HTMLElement)?.focus(),50)
  }

  private setStream(on:boolean){
    this.streaming=on
    const btn=this.root.querySelector('#obx-send')!; const st=this.root.querySelector('#obx-st')
    btn.innerHTML=on?IC.stop:IC.send; btn.classList.toggle('stop',on)
    if(st)st.innerHTML=on?'<span class="obx-dot" style="background:#f59e0b;box-shadow:0 0 0 0 rgba(245,158,11,.4)"></span>Thinking…':'<span class="obx-dot"></span>Online'
  }
}