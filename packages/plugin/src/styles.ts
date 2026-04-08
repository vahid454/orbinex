import type { WidgetConfig } from './types'

/**
 * Orbinex Chat Widget — styles.ts
 *
 * This file exports the full CSS as a string for SSR / pre-render use cases.
 * In normal browser usage, OrbinexWidget.css() is called internally and injected
 * into document.head automatically — you do NOT need to call this manually.
 *
 * Use case: if you want to server-side render a <style> tag:
 *   import { createStyles } from '@orbinex/plugin/src/styles'
 *   const css = createStyles({ primaryColor: '#6C5CE7', position: 'bottom-right', ... })
 *   // inject into your SSR HTML
 */
export function createStyles(cfg: WidgetConfig): string {
  const p    = cfg.primaryColor ?? '#6C5CE7'
  const right = cfg.position !== 'bottom-left'
  const edge  = right ? 'right' : 'left'
  const origin = right ? 'bottom right' : 'bottom left'

  return `
/* ═══════════════════════════════════════════════════════════
   Orbinex Chat Widget CSS
   Scoped to #obx — zero conflicts with host page styles
   ═══════════════════════════════════════════════════════════ */

#obx, #obx *, #obx *::before, #obx *::after {
  box-sizing: border-box;
  margin: 0; padding: 0;
  -webkit-font-smoothing: antialiased;
}

/* ── Root & CSS Variables ───────────────────────────────── */
#obx {
  position: fixed;
  ${edge}: 24px;
  bottom: 24px;
  z-index: 2147483646;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  font-size: 14px;

  /* Brand */
  --p:   ${p};
  --p15: color-mix(in srgb, ${p} 15%, transparent);
  --p20: color-mix(in srgb, ${p} 20%, transparent);

  /* Light mode surfaces */
  --bg:  #ffffff;
  --bg2: #f7f7f8;
  --bg3: #eeeef0;
  --bg4: #e5e5e7;

  /* Borders */
  --bd:  rgba(0, 0, 0, .08);
  --bd2: rgba(0, 0, 0, .12);

  /* Text */
  --tx:  #111111;
  --tx2: #555555;
  --tx3: #aaaaaa;

  /* Elevation */
  --shadow: 0 2px 8px rgba(0,0,0,.06),
            0 16px 48px rgba(0,0,0,.12),
            0 4px 16px rgba(0,0,0,.08);

  /* Geometry */
  --r: 24px;
  --t: .2s;

  /* Premium spacing & typography */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;

  --font-sm: 12px;
  --font-md: 14px;
  --font-lg: 16px;
  --font-xl: 18px;
}

/* Dark mode */
#obx[data-theme="dark"] {
  --bg:  #18181b;
  --bg2: #27272a;
  --bg3: #3f3f46;
  --bg4: #52525b;
  --bd:  rgba(255, 255, 255, .06);
  --bd2: rgba(255, 255, 255, .1);
  --tx:  #fafafa;
  --tx2: #a1a1aa;
  --tx3: #71717a;
  --shadow: 0 2px 8px rgba(0,0,0,.3),
            0 16px 48px rgba(0,0,0,.6);
}

/* ── Launcher Button ────────────────────────────────────── */
#obx-btn {
  width: 60px; height: 60px;
  border-radius: 50%;
  border: none; cursor: pointer;
  background: var(--p); color: #fff;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,.15),
              0 8px 24px color-mix(in srgb, var(--p) 40%, transparent);
  transition: transform var(--t) cubic-bezier(.34, 1.56, .64, 1),
              box-shadow var(--t),
              opacity .25s ease,
              transform .25s ease;
  position: relative;
  backdrop-filter: blur(8px);
}
#obx-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(0,0,0,.2),
              0 12px 32px color-mix(in srgb, var(--p) 50%, transparent);
}
#obx-btn:active { transform: scale(.94); }
#obx-btn svg    { width: 27px; height: 27px; }

#obx-badge {
  position: absolute; top: -2px; right: -2px;
  min-width: 20px; height: 20px; padding: 0 5px;
  background: #ff3b30; border: 2px solid white;
  border-radius: 10px;
  font-size: 10px; font-weight: 700; color: #fff;
  display: none; align-items: center; justify-content: center;
}

/* Launcher hides when chat opens */
#obx.open #obx-btn {
  opacity: 0;
  pointer-events: none;
  transform: scale(.7) translateY(6px);
}

/* ── Chat Window ────────────────────────────────────────── */
#obx-win {
  position: absolute;
  ${edge}: 0;
  bottom: 76px;
  width: 460px;
  height: 700px;
  background: var(--bg);
  border-radius: var(--r);
  box-shadow: var(--shadow);
  border: 1px solid var(--bd);
  display: flex;
  overflow: hidden;
  transform-origin: ${origin};
  animation: obx-open .28s cubic-bezier(.32, 1.12, .64, 1);
  backdrop-filter: blur(8px);
  will-change: transform;
}
#obx-win[hidden] { display: none; }

@keyframes obx-open {
  from { opacity: 0; transform: scale(.88) translateY(16px); }
  to   { opacity: 1; transform: scale(1)   translateY(0);    }
}

#obx-win.drag { transition: none; animation: none; }

/* ── History Overlay ────────────────────────────────────── */
/* Floats over the chat — never resizes it */
#obx-hist {
  position: absolute;
  top: 0; left: 0; bottom: 0;
  width: 0;
  overflow: hidden;
  background: var(--bg);
  display: flex; flex-direction: column;
  z-index: 20;
  border-radius: var(--r) 0 0 var(--r);
  border-right: 1px solid var(--bd);
  transition: width .26s cubic-bezier(.4, 0, .2, 1);
}
#obx-hist.on {
  width: 300px;
  box-shadow: 8px 0 32px rgba(0,0,0,.12);
}

/* Click-outside overlay */
#obx-hist-bg {
  display: none;
  position: absolute; inset: 0; z-index: 19;
  background: rgba(0, 0, 0, .2);
  border-radius: var(--r);
}
#obx-hist.on ~ #obx-hist-bg { display: block; }

/* History header — same 64px height as chat header */
#obx-hist-hd {
  height: 64px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid var(--bd);
  flex-shrink: 0;
  background: var(--bg);
}
.obx-hist-logo {
  display: flex; align-items: center; gap: 10px;
}
.obx-hist-av {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, var(--p), color-mix(in srgb, var(--p) 60%, #000));
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 13px; color: #fff; letter-spacing: .03em;
}
.obx-hist-lbl { font-size: 15px; font-weight: 600; color: var(--tx); }
.obx-hist-sub { font-size: 11px; color: var(--tx3); margin-top: 1px; }

/* New conversation button */
.obx-new-btn{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;

  width:calc(100% - 24px);
  margin:12px;

  padding:12px 16px;
  background:var(--p);
  color:#fff;
  border:none;
  border-radius:12px;

  cursor:pointer;
  font-size:13px;
  font-weight:500;
  font-family:inherit;

  transition:opacity .15s,transform .1s;
  flex-shrink:0;
}
.obx-new-btn svg { width: 15px; height: 15px; stroke: #fff; }
.obx-new-btn:hover  { opacity: .9; }
.obx-new-btn:active { transform: scale(.97); }

/* Session list */
#obx-sess {
  flex: 1; overflow-y: auto;
  padding: 6px 8px 16px;
}
#obx-sess::-webkit-scrollbar { width: 3px; }
#obx-sess::-webkit-scrollbar-thumb { background: var(--bd2); border-radius: 2px; }

.obx-si {
  display: flex; align-items: center; gap: 10px;
  padding: 10px;
  border-radius: 14px; cursor: pointer;
  transition: background .15s;
  margin-bottom: 3px;
}
.obx-si:hover {
  background: var(--bg2);
  transform: translateX(2px);
}
.obx-si.act    { background: var(--p15); }
.obx-si-ic     {
  width: 34px; height: 34px; border-radius: 10px;
  background: var(--bg3);
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; flex-shrink: 0;
}
.obx-si-tx  { flex: 1; min-width: 0; }
.obx-si-t   {
  font-size: 13px; font-weight: 500; color: var(--tx);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.obx-si.act .obx-si-t { color: var(--p); }
.obx-si-d   { font-size: 11px; color: var(--tx3); margin-top: 2px; }
.obx-si-del {
  background: none; border: none; cursor: pointer;
  color: var(--tx3); padding: 4px; border-radius: 7px;
  display: flex; flex-shrink: 0;
  opacity: 0; transition: opacity .15s;
}
.obx-si-del svg { width: 13px; height: 13px; }
.obx-si:hover .obx-si-del { opacity: 1; }
.obx-si-del:hover { color: #ff3b30; background: rgba(255, 59, 48, .1); }

/* ── Main chat column (always full width) ────────────────── */
#obx-main {
  flex: 1;
  display: flex; flex-direction: column;
  min-width: 0; position: relative;
}

/* ── Chat Header ────────────────────────────────────────── */
#obx-hd {
  height: 64px;
  display: flex; align-items: center; gap: 8px;
  padding: 0 var(--space-lg);
  border-bottom: 1px solid var(--bd);
  background: var(--bg);
  flex-shrink: 0;
  cursor: grab; user-select: none;
}
#obx-win.drag #obx-hd { cursor: grabbing; }

.obx-hd-av {
  width: 38px; height: 38px;
  border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, var(--p), color-mix(in srgb, var(--p) 55%, #000));
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 14px; color: #fff; letter-spacing: .02em;
}
.obx-hd-info { flex: 1; min-width: 0; }
.obx-hd-name {
  font-size: 15px; font-weight: 600; color: var(--tx);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.obx-hd-st {
  font-size: 11px; color: var(--tx3);
  display: flex; align-items: center; gap: 5px; margin-top: 2px;
}
.obx-acts { display: flex; gap: 2px; }

/* Status dot */
.obx-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #22c55e; flex-shrink: 0;
  animation: obx-pulse 2.5s infinite;
}
@keyframes obx-pulse {
  0%,100% { box-shadow: 0 0 0 0   rgba(34,197,94,.4); }
  60%     { box-shadow: 0 0 0 5px rgba(34,197,94, 0); }
}

/* ── Icon Button ────────────────────────────────────────── */
.obx-ib {
  width: 34px; height: 34px;
  border-radius: 9px;
  background: none; border: none; cursor: pointer;
  color: var(--tx2);
  display: flex; align-items: center; justify-content: center;
  transition: background .12s, color .12s, transform .1s;
  flex-shrink: 0;
}
.obx-ib svg { width: 17px; height: 17px; }
.obx-ib:hover  { background: var(--bg3); color: var(--tx); }
.obx-ib:active { transform: scale(.88); }

/* ── Messages Area ──────────────────────────────────────── */
#obx-msgs {
  flex: 1; overflow-y: auto;
  padding: var(--space-xl) var(--space-lg);
  display: flex; flex-direction: column; gap: 4px;
  scroll-behavior: smooth;
}
#obx-msgs::-webkit-scrollbar { width: 4px; }
#obx-msgs::-webkit-scrollbar-thumb { background: var(--bd2); border-radius: 2px; }

/* Date separator */
.obx-date { text-align: center; margin: 16px 0 8px; user-select: none; }
.obx-date span {
  font-size: 11px; color: var(--tx3);
  background: var(--bg2);
  padding: 4px 14px;
  border-radius: 20px;
  border: 1px solid var(--bd);
}

/* ── Message Rows ───────────────────────────────────────── */
.obx-row   { display: flex; flex-direction: column; margin-bottom: 6px; }
.obx-row-u { align-items: flex-end; }
.obx-row-a { align-items: flex-start; }
.obx-row-u + .obx-row-u,
.obx-row-a + .obx-row-a {
  margin-top: 2px;
}

.obx-inner {
  display: flex; align-items: flex-end; gap: 8px;
  max-width: 80%;
  align-items: flex-end;
}
.obx-row-u .obx-inner { flex-direction: row-reverse; }

/* Small avatar for assistant */
.obx-av-sm {
  width: 28px; height: 28px;
  border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, var(--p), color-mix(in srgb, var(--p) 55%, #000));
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; color: #fff;
  margin-bottom: 2px;
}

/* ── Message Bubbles — Messenger style ──────────────────── */
.obx-bbl {
  padding: 12px 16px;
  font-size: var(--font-md);
  line-height: 1.7;
  word-break: break-word;
  overflow-wrap: break-word;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  display: inline-block;
}

/* User — tail bottom-right */
.obx-row-u .obx-bbl {
  background: var(--p); color: #fff;
  border-radius: 20px 20px 6px 20px;
   box-shadow: 0 4px 12px color-mix(in srgb, var(--p) 25%, transparent);
}
/* Assistant — tail bottom-left */
.obx-row-a .obx-bbl {
  background: var(--bg2); color: var(--tx);
  border: 1px solid var(--bd);
  border-radius: 20px 20px 20px 6px;
   box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
/* Consecutive same-sender → fully round (no tail) */
.obx-row-u:not(:has(+ .obx-row-u)) .obx-bbl {
  border-radius: 20px 20px 6px 20px;
}
.obx-row-u:has(+ .obx-row-u) .obx-bbl {
  border-radius: 20px;
}
.obx-row-a:not(:has(+ .obx-row-a)) .obx-bbl {
  border-radius: 20px 20px 20px 6px;
}
.obx-row-a:has(+ .obx-row-a) .obx-bbl {
  border-radius: 20px;
}

/* ── Markdown Elements Inside Bubbles ───────────────────── */
.obx-bbl p              { margin: 0 0 8px; }
.obx-bbl p:last-child   { margin-bottom: 0; }
.obx-bbl h1, .obx-bbl h2,
.obx-bbl h3, .obx-bbl h4 { font-weight: 600; margin: 10px 0 5px; }
.obx-bbl h1             { font-size: 16px; }
.obx-bbl h2             { font-size: 15px; }
.obx-bbl h3, .obx-bbl h4 { font-size: 14px; }

/* Lists — fully inside bubble, never overflow */
.obx-bbl ul, .obx-bbl ol {
  padding-left: 20px; margin: 5px 0 8px;
}
.obx-bbl ul { list-style: disc; }
.obx-bbl ol { list-style: decimal; }
.obx-bbl li { margin-bottom: 4px; padding-left: 2px; }

.obx-bbl strong { font-weight: 600; }
.obx-bbl em     { font-style: italic; }
.obx-bbl del    { text-decoration: line-through; opacity: .6; }

/* Links */
.obx-bbl a {
  color: var(--p);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.obx-row-u .obx-bbl a { color: rgba(255,255,255,.85); }

/* Inline code */
.obx-ic {
  font-family: "SF Mono", Menlo, Consolas, "Courier New", monospace;
  font-size: 12px;
  background: rgba(0,0,0,.1);
  padding: 2px 6px; border-radius: 5px;
}
.obx-row-u .obx-ic { background: rgba(255,255,255,.2); }

/* Code blocks */
.obx-pre {
  background: #1a1b26;
  border-radius: 12px;
  margin: 8px 0;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.06);
}
.obx-pre-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 14px 6px;
  border-bottom: 1px solid rgba(255,255,255,.06);
}
.obx-lang {
  font-size: 11px; color: #7c7f9e;
  font-family: "SF Mono", Menlo, monospace; font-weight: 500;
}
.obx-pre-copy {
  background: rgba(255,255,255,.07); border: none;
  color: #9ca3af; font-size: 11px;
  padding: 3px 10px; border-radius: 5px;
  cursor: pointer; font-family: inherit;
}
.obx-pre-copy:hover { background: rgba(255,255,255,.12); color: #fff; }
.obx-pre code {
  display: block;
  padding: 12px 14px;
  color: #cdd6f4;
  font-family: "SF Mono", Menlo, Consolas, monospace;
  font-size: 12px; line-height: 1.6;
  overflow-x: auto; white-space: pre;
}

/* Tables */
.obx-tbl-w { overflow-x: auto; margin: 8px 0; }
.obx-tbl   { border-collapse: collapse; width: 100%; font-size: 13px; }
.obx-tbl th {
  background: rgba(0,0,0,.06); font-weight: 600; text-align: left;
}
.obx-tbl th, .obx-tbl td { padding: 8px 12px; border: 1px solid var(--bd2); }
.obx-row-u .obx-tbl th   { background: rgba(255,255,255,.15); }
.obx-row-u .obx-tbl th,
.obx-row-u .obx-tbl td   { border-color: rgba(255,255,255,.2); }

/* Blockquote */
.obx-bbl blockquote {
  border-left: 3px solid var(--p);
  padding-left: 12px; color: var(--tx2);
  font-style: italic; margin: 6px 0;
}
.obx-row-u .obx-bbl blockquote {
  border-left-color: rgba(255,255,255,.5);
  color: rgba(255,255,255,.8);
}
.obx-bbl hr { border: none; border-top: 1px solid var(--bd); margin: 10px 0; }

/* ── Message Meta Row ───────────────────────────────────── */
.obx-meta {
  display: flex; align-items: center; gap: 8px;
  padding: 4px 6px; min-height: 24px;
}
.obx-row-a .obx-meta { padding-left: 36px; }
.obx-mt { font-size: 10px; color: var(--tx3); }
.obx-cp {
  background: none; border: none; cursor: pointer;
  color: var(--tx3); padding: 2px 7px; border-radius: 6px;
  display: flex; align-items: center; gap: 3px;
  font-size: 11px; font-family: inherit;
  opacity: 0; transition: opacity .15s, color .12s;
}
.obx-cp svg { width: 12px; height: 12px; }
.obx-row-a:hover .obx-cp { opacity: 1; }
.obx-cp:hover { color: var(--p); background: var(--bg3); }

/* ── Typing Indicator ───────────────────────────────────── */
.obx-typing { display: flex; align-items: center; gap: 5px; padding: 4px 0; }
.obx-typing span {
  width: 7px; height: 7px;
  background: var(--tx3); border-radius: 50%; display: block;
  animation: obx-bb 1.2s infinite ease-in-out;
}
.obx-typing span:nth-child(2) { animation-delay: .18s; }
.obx-typing span:nth-child(3) { animation-delay: .36s; }
@keyframes obx-bb {
  0%,80%,100% { transform: scale(.55); opacity: .35; }
  40%         { transform: scale(1);   opacity: 1;   }
}

/* ── Empty / Welcome State ──────────────────────────────── */
.obx-empty {
  flex: 1;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center; padding: 32px 20px;
  gap: 14px; color: var(--tx3);
}
.obx-ei {
  width: 60px; height: 60px; border-radius: 20px;
  background: linear-gradient(135deg, var(--p), color-mix(in srgb, var(--p) 55%, #1a0a6b));
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px color-mix(in srgb, var(--p) 35%, transparent);
}
.obx-ei svg { width: 28px; height: 28px; stroke: #fff; }
.obx-et { font-size: 17px; font-weight: 700; color: var(--tx); letter-spacing: -.02em; }
.obx-es { font-size: 13px; line-height: 1.6; max-width: 280px; color: var(--tx2); }

/* Quick-start chips */
.obx-chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 6px; }
.obx-chip {
  background: var(--bg2); border: 1px solid var(--bd2);
  color: var(--tx2); font-size: 12px; font-family: inherit;
  padding: 7px 14px; border-radius: 20px; cursor: pointer;
  transition: all .15s; white-space: nowrap;
  display: flex; align-items: center; gap: 5px;
}
.obx-chip:hover {
  background: var(--p15); border-color: var(--p); color: var(--p);
}

/* ── Input Bar ──────────────────────────────────────────── */
#obx-bar {
  border-top: 1px solid var(--bd);
  background: var(--bg);
  flex-shrink: 0;
  padding: 12px;
}
#obx-input-row { display: flex; align-items: flex-end; gap: 8px; }
#obx-in {
  flex: 1;
  border: 1.5px solid var(--bd2);
  border-radius: 16px;
  background: linear-gradient(180deg, var(--bg2), var(--bg));
  padding: 10px 16px;
  background: var(--bg2); color: var(--tx);
  font-size: 14px; font-family: inherit;
  resize: none; outline: none;
  max-height: 130px; overflow-y: auto;
  line-height: 1.55;
  transition: border-color .15s, background .15s, box-shadow .15s;
}
#obx-in::placeholder { color: var(--tx3); }
#obx-in:focus {
  border-color: var(--p); background: var(--bg);
  box-shadow: 0 0 0 4px var(--p15);
}
.obx-bar-btns { display: flex; align-items: center; gap: 4px; }
.obx-mic { color: var(--tx3); }
.obx-mic.rec {
  color: var(--p); background: var(--p15);
  animation: obx-mic-pulse .9s infinite alternate;
}
@keyframes obx-mic-pulse {
  from { box-shadow: 0 0 0 0 var(--p15); }
  to   { box-shadow: 0 0 0 6px transparent; }
}
.obx-upload-btn { color: var(--tx3); }

#obx-send {
  width: 44px; height: 44px; flex-shrink: 0;
  border-radius: 50%;
  background: var(--p); color: #fff; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 6px 18px color-mix(in srgb, var(--p) 45%, transparent);
  transition: transform .12s, opacity .12s, background .18s;
}
#obx-send svg    { width: 16px; height: 16px; }
#obx-send:hover  { opacity: .9; transform: scale(1.08) translateY(-1px); }
#obx-send:active { transform: scale(.92); }
#obx-send.stop   {
  background: #ff3b30;
  box-shadow: 0 2px 8px rgba(255, 59, 48, .4);
}

#obx-foot {
  font-size: 10px; color: var(--tx3);
  text-align: center; margin-top: 8px;
}

/* ── Document Upload Badge ──────────────────────────────── */
#obx-doc-badge {
  display: none; align-items: center; gap: 8px;
  background: var(--bg2); border: 1px solid var(--bd);
  border-radius: 10px; padding: 8px 12px;
  margin-top: 8px; font-size: 12px; color: var(--tx2);
}
#obx-doc-badge.on { display: flex; }
.obx-doc-name {
  flex: 1; font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.obx-doc-x {
  background: none; border: none; cursor: pointer;
  color: var(--tx3); padding: 0; display: flex; align-items: center;
}
.obx-doc-x svg    { width: 14px; height: 14px; }
.obx-doc-status   { font-size: 11px; color: var(--tx3); }

/* ── Fullscreen / Fullpage ──────────────────────────────── */
#obx[data-mode="fullpage"] #obx-btn { display: none; }

#obx[data-mode="fullpage"] #obx-win,
#obx.fs #obx-win {
  position: fixed;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  border-radius: 0;
  bottom: 0 !important;
  right: 0 !important;
  left: 0 !important;
  top: 0 !important;
  border: none;
  animation: none;
}
#obx.fs #obx-hist { border-radius: 0; }

/* ── Responsive ─────────────────────────────────────────── */
@media (max-width: 460px) {
  #obx-win { width: calc(100vw - 16px) !important; }
}

.obx-row {
  animation: obx-fade-in 0.25s ease;
}

/* Fix bubble tearing & grouping */
.obx-row-u .obx-inner,
.obx-row-a .obx-inner {
  gap: 6px;
}

.obx-row-u .obx-bbl,
.obx-row-a .obx-bbl {
  max-width: 100%;
}

@keyframes obx-fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
`
}