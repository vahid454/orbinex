import type { WidgetConfig } from './types'

export function createStyles(cfg: WidgetConfig): string {
  const c = cfg.primaryColor ?? '#6C5CE7'
  const isLeft = cfg.position === 'bottom-left'

  return `
#obx-root *, #obx-root *::before, #obx-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
#obx-root {
  position: fixed;
  bottom: 24px; ${isLeft ? 'left: 24px' : 'right: 24px'};
  z-index: 2147483647;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px; line-height: 1.5; color-scheme: light dark;
  --p: ${c};
  --bg:    #ffffff; --bg2: #f7f7f8; --bg3: #ebebec;
  --bd:    #e4e4e4; --bd2: #d0d0d0;
  --tx:    #111111; --tx2: #555555; --tx3: #999999;
  --sh:    0 12px 48px rgba(0,0,0,.16), 0 2px 8px rgba(0,0,0,.08);
  --r:     18px; --ri: 12px;
  --sb:    240px;
}
#obx-root[data-theme=dark] {
  --bg:  #1c1c1e; --bg2: #2c2c2e; --bg3: #3a3a3c;
  --bd:  #3a3a3c; --bd2: #48484a;
  --tx:  #f2f2f7; --tx2: #aeaeb2; --tx3: #636366;
  --sh:  0 12px 48px rgba(0,0,0,.5), 0 2px 8px rgba(0,0,0,.3);
}

/* ── Launcher bubble ── */
#obx-launcher {
  width: 58px; height: 58px; border-radius: 50%;
  background: var(--p); color: #fff;
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 20px rgba(0,0,0,.22), 0 1px 4px rgba(0,0,0,.12);
  transition: transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s;
  position: relative;
}
#obx-launcher:hover { transform: scale(1.1); box-shadow: 0 6px 28px rgba(0,0,0,.28); }
#obx-launcher:active { transform: scale(.94); }
#obx-launcher svg { width: 26px; height: 26px; fill: currentColor; }
.obx-badge {
  position: absolute; top: 0; right: 0;
  width: 16px; height: 16px; border-radius: 50%;
  background: #ff3b30; border: 2px solid #fff;
  font-size: 9px; font-weight: 700; color: #fff;
  display: flex; align-items: center; justify-content: center;
}

/* ── Window ── */
#obx-window {
  position: absolute;
  ${isLeft ? 'left: 0' : 'right: 0'};
  bottom: 70px;
  width: 400px; height: 620px;
  background: var(--bg);
  border-radius: var(--r);
  box-shadow: var(--sh);
  border: 1px solid var(--bd);
  display: flex; overflow: hidden;
  animation: obx-open .25s cubic-bezier(.32,1.1,.64,1);
  transform-origin: ${isLeft ? 'bottom left' : 'bottom right'};
}
#obx-window[hidden] { display: none; }
@keyframes obx-open { from { opacity:0; transform:scale(.9) translateY(8px) } to { opacity:1; transform:scale(1) translateY(0) } }

/* ── Sidebar ── */
#obx-sb {
  width: 0; flex-shrink: 0; overflow: hidden;
  background: var(--bg2);
  border-right: 1px solid var(--bd);
  display: flex; flex-direction: column;
  transition: width .22s cubic-bezier(.4,0,.2,1);
}
#obx-sb.open { width: var(--sb); }
.obx-sb-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 12px 10px; flex-shrink: 0;
}
.obx-sb-title { font-size: 12px; font-weight: 600; color: var(--tx2); text-transform: uppercase; letter-spacing: .06em; }
#obx-sb-list { flex: 1; overflow-y: auto; padding: 4px 6px 12px; }
#obx-sb-list::-webkit-scrollbar { width: 0; }
.obx-si {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: 10px;
  cursor: pointer; transition: background .12s;
  user-select: none;
}
.obx-si:hover { background: var(--bg3); }
.obx-si.active { background: color-mix(in srgb, var(--p) 12%, transparent); }
.obx-si-icon { width: 28px; height: 28px; border-radius: 8px; background: var(--bg3); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:14px; }
.obx-si-info { flex:1; min-width:0; }
.obx-si-title { font-size: 12px; font-weight: 500; color: var(--tx); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.obx-si-time { font-size: 10px; color: var(--tx3); margin-top: 1px; }
.obx-si.active .obx-si-title { color: var(--p); }
.obx-si-del { background:none; border:none; cursor:pointer; color:var(--tx3); padding:3px; border-radius:5px; display:flex; opacity:0; transition:opacity .12s; flex-shrink:0; }
.obx-si-del svg { width:13px; height:13px; fill:currentColor; }
.obx-si:hover .obx-si-del { opacity:1; }
.obx-si-del:hover { color:#ff3b30; background:rgba(255,59,48,.12); }

/* ── Main column ── */
#obx-main { flex:1; display:flex; flex-direction:column; min-width:0; }

/* ── Header ── */
#obx-hd {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 12px 12px 14px;
  border-bottom: 1px solid var(--bd);
  background: var(--bg); flex-shrink: 0;
}
#obx-hd-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, var(--p), color-mix(in srgb, var(--p) 60%, #000));
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; flex-shrink: 0; color: #fff;
}
#obx-hd-info { flex: 1; min-width: 0; }
#obx-hd-name { font-size: 14px; font-weight: 600; color: var(--tx); }
#obx-hd-status { display:flex; align-items:center; gap:5px; font-size:11px; color:var(--tx3); margin-top:1px; }
.obx-dot { width:7px; height:7px; border-radius:50%; background:#30d158; animation: obx-pulse 2.4s infinite; }
@keyframes obx-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(48,209,88,.4)} 60%{box-shadow:0 0 0 5px rgba(48,209,88,0)} }
.obx-hd-acts { display:flex; gap:2px; }

/* ── Icon button ── */
.obx-ib {
  width: 32px; height: 32px; border-radius: 8px;
  background: none; border: none; cursor: pointer;
  color: var(--tx2); display: flex; align-items: center; justify-content: center;
  transition: background .12s, color .12s; flex-shrink: 0;
}
.obx-ib svg { width: 17px; height: 17px; fill: currentColor; }
.obx-ib:hover { background: var(--bg3); color: var(--tx); }
.obx-ib:active { transform: scale(.88); }

/* ── Messages area ── */
#obx-msgs {
  flex: 1; overflow-y: auto;
  padding: 16px 14px;
  display: flex; flex-direction: column; gap: 4px;
  scroll-behavior: smooth;
}
#obx-msgs::-webkit-scrollbar { width: 4px; }
#obx-msgs::-webkit-scrollbar-thumb { background: var(--bd); border-radius: 2px; }

/* ── Date separator ── */
.obx-sep { text-align:center; margin:12px 0 8px; }
.obx-sep span { font-size:10px; color:var(--tx3); background:var(--bg2); padding:2px 10px; border-radius:20px; }

/* ── Message rows ── */
.obx-row { display:flex; flex-direction:column; margin-bottom:10px; }
.obx-row--u { align-items:flex-end; }
.obx-row--a { align-items:flex-start; }
.obx-row--u + .obx-row--u,
.obx-row--a + .obx-row--a { margin-top:-6px; }

.obx-msg-wrap { max-width: 84%; display: flex; align-items: flex-end; gap: 6px; }
.obx-row--u .obx-msg-wrap { flex-direction: row-reverse; }

.obx-av {
  width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, var(--p), color-mix(in srgb, var(--p) 60%, #000));
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; color: #fff; margin-bottom: 2px;
}

.obx-bbl {
  padding: 10px 14px; border-radius: 18px;
  font-size: 14px; color: var(--tx); line-height: 1.6;
  word-break: break-word;
}
.obx-row--u .obx-bbl {
  background: var(--p); color: #fff;
  border-bottom-right-radius: 5px;
}
.obx-row--a .obx-bbl {
  background: var(--bg2);
  border: 1px solid var(--bd);
  border-bottom-left-radius: 5px;
}

/* ── Markdown inside bubbles ── */
.obx-bbl p { margin: 0 0 8px; }
.obx-bbl p:last-child { margin-bottom: 0; }
.obx-bbl strong { font-weight: 600; }
.obx-bbl em { font-style: italic; }
.obx-bbl a { color: var(--p); text-decoration: underline; }
.obx-row--u .obx-bbl a { color: rgba(255,255,255,.85); }
.obx-bbl ul, .obx-bbl ol { padding-left: 18px; margin: 4px 0 8px; }
.obx-bbl li { margin-bottom: 3px; }
.obx-bbl h1,.obx-bbl h2,.obx-bbl h3 { font-weight: 600; margin: 10px 0 4px; }
.obx-bbl h1 { font-size: 15px; } .obx-bbl h2 { font-size: 14px; } .obx-bbl h3 { font-size: 13px; }
.obx-bbl code {
  font-family: 'SF Mono', Menlo, Consolas, monospace; font-size: 12px;
  background: rgba(0,0,0,.08); padding: 1px 5px; border-radius: 4px;
}
.obx-row--u .obx-bbl code { background: rgba(255,255,255,.2); }
.obx-bbl pre {
  background: #1e1e2e; color: #cdd6f4;
  border-radius: 10px; padding: 12px 14px; margin: 8px 0;
  overflow-x: auto; font-size: 12px; font-family: 'SF Mono', Menlo, Consolas, monospace;
  line-height: 1.55;
}
.obx-bbl pre code { background: none; padding: 0; color: inherit; font-size: inherit; }
.obx-bbl table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 13px; }
.obx-bbl th { background: rgba(0,0,0,.06); font-weight: 600; }
.obx-bbl th, .obx-bbl td { padding: 6px 10px; border: 1px solid var(--bd); text-align: left; }
.obx-row--u .obx-bbl table th { background: rgba(255,255,255,.15); }
.obx-row--u .obx-bbl th, .obx-row--u .obx-bbl td { border-color: rgba(255,255,255,.2); }
.obx-bbl blockquote {
  border-left: 3px solid var(--p); padding-left: 12px; margin: 6px 0;
  color: var(--tx2); font-style: italic;
}
.obx-bbl hr { border: none; border-top: 1px solid var(--bd); margin: 10px 0; }

/* Message meta row */
.obx-meta { display:flex; align-items:center; gap:8px; padding:2px 4px; margin-top:2px; }
.obx-time { font-size:10px; color:var(--tx3); }
.obx-copy { background:none; border:none; cursor:pointer; color:var(--tx3); padding:2px 4px; border-radius:4px; display:flex; align-items:center; gap:3px; font-size:10px; opacity:0; transition:opacity .12s; }
.obx-copy svg { width:11px; height:11px; fill:currentColor; }
.obx-row--a:hover .obx-copy { opacity:1; }
.obx-copy:hover { color:var(--p); background:var(--bg3); }

/* ── Empty state ── */
.obx-empty { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; padding:24px; text-align:center; color:var(--tx3); }
.obx-empty-icon { width:48px; height:48px; border-radius:16px; background:var(--bg2); display:flex; align-items:center; justify-content:center; font-size:22px; }
.obx-empty-t { font-size:15px; font-weight:600; color:var(--tx2); }
.obx-empty-s { font-size:12px; line-height:1.6; max-width:240px; }
.obx-chips { display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin-top:6px; }
.obx-chip { background:var(--bg2); border:1px solid var(--bd); color:var(--tx2); font-size:11px; padding:5px 10px; border-radius:20px; cursor:pointer; transition:all .12s; }
.obx-chip:hover { background:color-mix(in srgb, var(--p) 10%, transparent); border-color:var(--p); color:var(--p); }

/* ── Typing indicator ── */
.obx-typing { display:flex; align-items:center; gap:5px; padding:4px 2px; }
.obx-typing span { display:block; width:7px; height:7px; background:var(--tx3); border-radius:50%; animation:obx-bb 1.2s infinite ease-in-out; }
.obx-typing span:nth-child(2) { animation-delay:.18s; }
.obx-typing span:nth-child(3) { animation-delay:.36s; }
@keyframes obx-bb { 0%,80%,100%{transform:scale(.55);opacity:.35} 40%{transform:scale(1);opacity:1} }

/* ── Input bar ── */
#obx-bar {
  border-top: 1px solid var(--bd);
  background: var(--bg); flex-shrink: 0;
}
#obx-bar-inner {
  display:flex; align-items:flex-end; gap:8px;
  padding: 10px 10px 8px;
}
#obx-in {
  flex:1; border:1.5px solid var(--bd2);
  border-radius: 22px; padding: 9px 14px;
  background: var(--bg2); color: var(--tx);
  font-size: 14px; font-family: inherit;
  resize: none; outline: none; max-height: 130px; overflow-y: auto;
  transition: border-color .15s, background .15s;
  line-height: 1.5;
}
#obx-in::placeholder { color: var(--tx3); }
#obx-in:focus { border-color: var(--p); background: var(--bg); }
#obx-send {
  width: 38px; height: 38px; flex-shrink: 0; border-radius: 50%;
  background: var(--p); color: #fff; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: transform .12s, opacity .12s, background .18s;
}
#obx-send svg { width: 17px; height: 17px; fill: currentColor; }
#obx-send:hover { opacity: .88; transform: scale(1.06); }
#obx-send:active { transform: scale(.92); }
#obx-send.stop { background: #ff3b30; }
#obx-foot { text-align:center; font-size:10px; color:var(--tx3); padding:0 12px 8px; }
#obx-foot a { color:var(--tx3); text-decoration:none; }
#obx-foot a:hover { color:var(--p); }

/* ── Expand/fullscreen button ── */
#obx-expand-btn { position:absolute; top:0; right:0; /* handled per-mode */ }

/* ── Fullpage mode ── */
#obx-root[data-mode=fullpage] #obx-launcher { display:none; }
#obx-root[data-mode=fullpage] #obx-window,
#obx-root.fullscreen #obx-window {
  position:fixed; inset:0; width:100%; height:100%;
  border-radius:0; bottom:0; right:0; left:0; border:none;
  animation: none;
}

/* ── Resize handle (panel mode) ── */
@media (max-width: 480px) {
  #obx-window { width: calc(100vw - 24px); }
}
  `
}