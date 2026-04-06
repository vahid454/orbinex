import type { WidgetConfig } from './types'

export function createStyles(cfg: WidgetConfig): string {
  const c   = cfg.primaryColor ?? '#6C5CE7'
  const pos = cfg.position !== 'bottom-left'

  return `
  /* ── Reset & root ────────────────────────────── */
  #orbinex-root *, #orbinex-root *::before, #orbinex-root *::after {
    box-sizing: border-box; margin: 0; padding: 0;
  }
  #orbinex-root {
    position: fixed;
    bottom: 24px; ${pos ? 'right: 24px' : 'left: 24px'};
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    font-size: 14px;
    --obx-primary: ${c};
    --obx-bg:      #ffffff;
    --obx-bg2:     #f7f7f8;
    --obx-bg3:     #efefef;
    --obx-border:  #e5e5e5;
    --obx-text:    #111111;
    --obx-text2:   #666666;
    --obx-text3:   #999999;
    --obx-shadow:  0 8px 40px rgba(0,0,0,.18);
    --obx-radius:  16px;
    --obx-sidebar: 240px;
    line-height: 1.55;
  }
  #orbinex-root[data-theme=dark] {
    --obx-bg:     #1c1c1e;
    --obx-bg2:    #2c2c2e;
    --obx-bg3:    #3a3a3c;
    --obx-border: #3a3a3c;
    --obx-text:   #f2f2f7;
    --obx-text2:  #aeaeb2;
    --obx-text3:  #636366;
    --obx-shadow: 0 8px 40px rgba(0,0,0,.5);
  }

  /* ── Bubble ─────────────────────────────────── */
  #obx-bubble {
    width: 58px; height: 58px;
    background: var(--obx-primary);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    box-shadow: var(--obx-shadow);
    transition: transform .18s cubic-bezier(.34,1.56,.64,1), box-shadow .18s;
    user-select: none; position: relative;
  }
  #obx-bubble:hover { transform: scale(1.1); box-shadow: 0 10px 48px rgba(0,0,0,.26); }
  #obx-bubble:active { transform: scale(.95); }
  .obx-bubble-icon { width: 26px; height: 26px; color: #fff; }
  .obx-bubble-icon svg { width: 100%; height: 100%; }
  .obx-unread {
    position: absolute; top: 2px; right: 2px;
    width: 14px; height: 14px;
    background: #ff3b30; border-radius: 50%;
    border: 2px solid #fff;
  }

  /* ── Panel ──────────────────────────────────── */
  #obx-panel {
    position: absolute;
    bottom: 70px; ${pos ? 'right: 0' : 'left: 0'};
    width: 400px; height: 600px;
    background: var(--obx-bg);
    border-radius: var(--obx-radius);
    box-shadow: var(--obx-shadow);
    display: flex; overflow: hidden;
    border: 1px solid var(--obx-border);
    animation: obx-pop .22s cubic-bezier(.34,1.2,.64,1);
  }
  #obx-panel[hidden] { display: none; }
  @keyframes obx-pop {
    from { opacity: 0; transform: scale(.92) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  /* ── Sidebar ────────────────────────────────── */
  #obx-sidebar {
    width: 0; overflow: hidden;
    background: var(--obx-bg2);
    border-right: 1px solid var(--obx-border);
    display: flex; flex-direction: column;
    transition: width .22s ease;
    flex-shrink: 0;
  }
  #obx-sidebar.open { width: var(--obx-sidebar); }
  .obx-sidebar-header {
    padding: 16px 14px 12px;
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0;
    border-bottom: 1px solid var(--obx-border);
  }
  .obx-sidebar-title { font-weight: 600; font-size: 13px; color: var(--obx-text); }
  #obx-session-list { flex: 1; overflow-y: auto; padding: 8px 0; }
  #obx-session-list::-webkit-scrollbar { width: 3px; }
  #obx-session-list::-webkit-scrollbar-thumb { background: var(--obx-border); border-radius: 2px; }
  .obx-session-item {
    display: flex; align-items: center; gap: 6px;
    padding: 9px 14px;
    cursor: pointer;
    border-radius: 8px; margin: 2px 6px;
    transition: background .12s;
    min-width: 0;
  }
  .obx-session-item:hover { background: var(--obx-bg3); }
  .obx-session-item.active { background: var(--obx-primary)22; }
  .obx-session-title {
    flex: 1; font-size: 12px; color: var(--obx-text2);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .obx-session-item.active .obx-session-title { color: var(--obx-primary); font-weight: 500; }
  .obx-session-del {
    background: none; border: none; cursor: pointer;
    color: var(--obx-text3); padding: 2px; border-radius: 4px;
    opacity: 0; transition: opacity .12s;
    display: flex; align-items: center; flex-shrink: 0;
  }
  .obx-session-del svg { width: 14px; height: 14px; }
  .obx-session-item:hover .obx-session-del { opacity: 1; }
  .obx-session-del:hover { color: #ff3b30 !important; background: #ff3b3011; }

  /* ── Main area ──────────────────────────────── */
  #obx-main {
    flex: 1; display: flex; flex-direction: column; min-width: 0;
    transition: margin-left .22s ease;
  }

  /* ── Header ─────────────────────────────────── */
  #obx-header {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 14px;
    border-bottom: 1px solid var(--obx-border);
    flex-shrink: 0; background: var(--obx-bg);
  }
  #obx-header-info { flex: 1; min-width: 0; }
  #obx-header-title { font-weight: 600; font-size: 14px; color: var(--obx-text); }
  #obx-header-status {
    display: flex; align-items: center; gap: 5px;
    font-size: 11px; color: var(--obx-text3); margin-top: 1px;
  }
  .obx-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #30d158; flex-shrink: 0;
    box-shadow: 0 0 0 2px #30d15833;
    animation: obx-pulse 2.5s infinite;
  }
  @keyframes obx-pulse { 0%,100%{box-shadow:0 0 0 2px #30d15833} 50%{box-shadow:0 0 0 4px #30d15811} }
  .obx-header-actions { display: flex; gap: 4px; }

  /* ── Icon buttons ───────────────────────────── */
  .obx-icon-btn {
    background: none; border: none; cursor: pointer;
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: var(--obx-text2);
    transition: background .12s, color .12s;
    flex-shrink: 0;
  }
  .obx-icon-btn svg { width: 18px; height: 18px; }
  .obx-icon-btn:hover { background: var(--obx-bg3); color: var(--obx-text); }
  .obx-icon-btn:active { transform: scale(.9); }

  /* ── Messages ───────────────────────────────── */
  #obx-messages {
    flex: 1; overflow-y: auto;
    padding: 16px 14px;
    display: flex; flex-direction: column; gap: 14px;
    scroll-behavior: smooth;
  }
  #obx-messages::-webkit-scrollbar { width: 4px; }
  #obx-messages::-webkit-scrollbar-thumb { background: var(--obx-border); border-radius: 2px; }

  .obx-empty {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center; gap: 10px;
    padding: 20px; color: var(--obx-text3);
    margin: auto;
  }
  .obx-empty-icon { width: 40px; height: 40px; opacity: .3; color: var(--obx-primary); }
  .obx-empty-icon svg { width: 100%; height: 100%; }
  .obx-empty-text { font-weight: 600; font-size: 15px; color: var(--obx-text2); }
  .obx-empty-sub  { font-size: 12px; line-height: 1.6; max-width: 220px; }

  .obx-msg { display: flex; flex-direction: column; max-width: 85%; gap: 4px; }
  .obx-msg--user      { align-self: flex-end; align-items: flex-end; }
  .obx-msg--assistant { align-self: flex-start; align-items: flex-start; }

  .obx-bubble-msg {
    padding: 10px 14px;
    border-radius: 16px;
    word-break: break-word;
    line-height: 1.6;
    font-size: 14px;
    white-space: pre-wrap;
  }
  .obx-msg--user .obx-bubble-msg {
    background: var(--obx-primary); color: #fff;
    border-bottom-right-radius: 4px;
  }
  .obx-msg--assistant .obx-bubble-msg {
    background: var(--obx-bg2); color: var(--obx-text);
    border-bottom-left-radius: 4px;
    border: 1px solid var(--obx-border);
  }
  .obx-bubble-msg code {
    background: rgba(0,0,0,.1); padding: 1px 5px;
    border-radius: 4px; font-size: 12px; font-family: monospace;
  }
  .obx-msg--user .obx-bubble-msg code { background: rgba(255,255,255,.2); }
  .obx-bubble-msg pre {
    background: rgba(0,0,0,.08); padding: 10px 12px;
    border-radius: 8px; overflow-x: auto; margin: 6px 0;
    font-size: 12px; font-family: monospace; white-space: pre;
  }
  .obx-msg--user .obx-bubble-msg pre { background: rgba(255,255,255,.15); }

  .obx-msg-meta {
    display: flex; align-items: center; gap: 8px;
    padding: 0 4px;
  }
  .obx-msg-time { font-size: 10px; color: var(--obx-text3); }
  .obx-copy-btn {
    background: none; border: none; cursor: pointer;
    color: var(--obx-text3); padding: 2px; border-radius: 4px;
    display: flex; align-items: center; opacity: 0;
    transition: opacity .15s;
  }
  .obx-copy-btn svg { width: 13px; height: 13px; }
  .obx-msg--assistant:hover .obx-copy-btn { opacity: 1; }
  .obx-copy-btn:hover { color: var(--obx-primary); background: var(--obx-bg3); }

  /* ── Typing ─────────────────────────────────── */
  .obx-typing { display: flex; align-items: center; gap: 5px; padding: 14px 16px; }
  .obx-typing span {
    display: block; width: 7px; height: 7px;
    background: var(--obx-text3); border-radius: 50%;
    animation: obx-bounce 1.2s infinite ease-in-out;
  }
  .obx-typing span:nth-child(1) { animation-delay: 0s; }
  .obx-typing span:nth-child(2) { animation-delay: .2s; }
  .obx-typing span:nth-child(3) { animation-delay: .4s; }
  @keyframes obx-bounce { 0%,80%,100%{transform:scale(.6);opacity:.4} 40%{transform:scale(1);opacity:1} }

  /* ── Input ──────────────────────────────────── */
  #obx-input-area {
    border-top: 1px solid var(--obx-border);
    background: var(--obx-bg); flex-shrink: 0;
  }
  #obx-input-row {
    display: flex; align-items: flex-end; gap: 8px;
    padding: 10px 12px 8px;
  }
  #obx-input {
    flex: 1; padding: 9px 13px;
    border: 1.5px solid var(--obx-border);
    border-radius: 22px;
    background: var(--obx-bg2); color: var(--obx-text);
    font-size: 14px; font-family: inherit;
    outline: none; resize: none;
    max-height: 140px; overflow-y: auto;
    transition: border-color .15s, background .15s;
    line-height: 1.5;
  }
  #obx-input::placeholder { color: var(--obx-text3); }
  #obx-input:focus { border-color: var(--obx-primary); background: var(--obx-bg); }
  #obx-send-btn {
    width: 38px; height: 38px; flex-shrink: 0;
    border: none; border-radius: 50%;
    background: var(--obx-primary); color: #fff;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: transform .12s, opacity .12s, background .2s;
  }
  #obx-send-btn svg { width: 17px; height: 17px; }
  #obx-send-btn:hover { opacity: .88; transform: scale(1.06); }
  #obx-send-btn:active { transform: scale(.92); }
  #obx-send-btn.streaming { background: #ff3b30; }
  #obx-footer {
    text-align: center; font-size: 10px; color: var(--obx-text3);
    padding: 0 12px 8px;
  }

  /* ── Fullpage mode ──────────────────────────── */
  #orbinex-root[data-mode=fullpage] #obx-bubble { display: none; }
  #orbinex-root[data-mode=fullpage] #obx-panel {
    position: fixed; inset: 0; width: 100%; height: 100%;
    border-radius: 0; bottom: 0; right: 0; left: 0;
  }
  `
}