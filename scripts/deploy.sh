#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
#  ORBINEX — One-Shot Deployment Script
#  Deploys: Engine → Vercel | MCP Server → Railway | Plugin → Cloudflare
#
#  Usage: bash deploy.sh
#  Time:  ~15 minutes total
# ═══════════════════════════════════════════════════════════════════
set -euo pipefail

# ── Colors ──────────────────────────────────────────────────────
B='\033[1m'; C='\033[36m'; G='\033[32m'; Y='\033[33m'; R='\033[31m'; X='\033[0m'
step()  { echo; echo -e "${C}${B}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${X}"; echo -e "${C}${B}  $1${X}"; echo -e "${C}${B}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${X}"; echo; }
ok()    { echo -e "  ${G}✓${X}  $1"; }
info()  { echo -e "  ${C}→${X}  $1"; }
warn()  { echo -e "  ${Y}!${X}  $1"; }
err()   { echo -e "  ${R}✗${X}  $1"; }
ask()   { echo -en "  ${B}?${X}  $1: "; }
pause() { echo; ask "Press Enter to continue when done"; read -r; }

# ── Banner ──────────────────────────────────────────────────────
clear
echo
echo -e "${C}${B}"
echo "  ╔═══════════════════════════════════════════╗"
echo "  ║         ORBINEX DEPLOYMENT WIZARD         ║"
echo "  ║   Engine · MCP Server · Plugin (CDN)      ║"
echo "  ╚═══════════════════════════════════════════╝"
echo -e "${X}"
echo "  This script walks you through deploying all 3 services."
echo "  Each step opens a browser URL — follow the instructions."
echo "  Total time: ~15 minutes."
echo

# ── Prerequisites ────────────────────────────────────────────────
step "STEP 0 — Prerequisites"

command -v git  &>/dev/null && ok "git found" || { err "git not found — install from https://git-scm.com"; exit 1; }
command -v node &>/dev/null && ok "node $(node -v)" || { err "Node.js not found — install from https://nodejs.org"; exit 1; }
command -v npm  &>/dev/null && ok "npm $(npm -v)"   || { err "npm not found"; exit 1; }

# Must run from orbinex root
if [ ! -f "package.json" ] || ! grep -q '"name": "orbinex"' package.json 2>/dev/null; then
  err "Run this script from the orbinex root directory (where package.json is)"
  exit 1
fi
ok "Running from orbinex root ✓"

# Check GitHub remote
GITHUB_REPO=$(git config --get remote.origin.url 2>/dev/null \
  | sed 's|.*github\.com[:/]||' | sed 's|\.git$||' || echo "")

if [ -z "$GITHUB_REPO" ]; then
  warn "No GitHub remote found."
  echo
  echo "  Before deploying, push your code to GitHub:"
  echo "  1. Create a new repo at https://github.com/new"
  echo "  2. Run:"
  echo "       git remote add origin https://github.com/YOUR_USERNAME/orbinex.git"
  echo "       git push -u origin main"
  echo
  ask "Enter your GitHub username/orbinex-repo (e.g. vahid454/orbinex)"; read -r GITHUB_REPO
fi
ok "GitHub repo: https://github.com/$GITHUB_REPO"

# ── Build plugin first ───────────────────────────────────────────
step "STEP 1 — Build the plugin JS"

info "Installing dependencies and building plugin..."
npm install --silent 2>/dev/null || true
cd packages/plugin
npm install --silent 2>/dev/null || true

if npm run build --silent 2>/dev/null; then
  PLUGIN_FILE="dist/orbinex.iife.js"
  if [ -f "$PLUGIN_FILE" ]; then
    SIZE=$(du -sh "$PLUGIN_FILE" 2>/dev/null | cut -f1 || echo "?")
    ok "Plugin built → dist/orbinex.iife.js ($SIZE)"
  fi
else
  warn "Build had warnings — check output above. Continuing..."
fi
cd ../..

# ═══════════════════════════════════════════════════════════════════
#  PART A — ENGINE on VERCEL
# ═══════════════════════════════════════════════════════════════════

step "STEP 2 — Deploy Engine to Vercel (your AI backend)"

echo "  The engine handles all AI conversations. It runs on Vercel for free."
echo
echo "  ┌─────────────────────────────────────────────────────────┐"
echo "  │  WHAT TO DO IN VERCEL (takes ~5 minutes)               │"
echo "  │                                                         │"
echo "  │  1. Open → https://vercel.com/new                      │"
echo "  │  2. Click 'Import Git Repository'                       │"
echo "  │  3. Find and select: $GITHUB_REPO"
echo "  │  4. Set these EXACTLY:                                  │"
echo "  │       Root Directory:  packages/engine                  │"
echo "  │       Build Command:   npm run build                    │"
echo "  │       Output Dir:      dist                             │"
echo "  │       Install Command: npm install                      │"
echo "  │  5. Click Deploy (first deploy — no env vars yet)       │"
echo "  │  6. After deploy → Settings → Environment Variables     │"
echo "  │     Add ALL of these:                                   │"
echo "  │                                                         │"
echo "  │     LLM_PROVIDER    = anthropic                         │"
echo "  │     LLM_MODEL       = claude-haiku-4-5-20251001         │"
echo "  │     LLM_API_KEY     = sk-ant-... ← your key             │"
echo "  │     MCP_SERVER_URL  = (leave blank for now)             │"
echo "  │     MCP_API_KEY     = orbinex-secret-2025               │"
echo "  │     LLM_MAX_TOKENS  = 2048                              │"
echo "  │     LLM_TEMPERATURE = 0.7                               │"
echo "  │     MAX_HISTORY     = 20                                │"
echo "  │                                                         │"
echo "  │  7. Redeploy → Deployments → ... → Redeploy             │"
echo "  └─────────────────────────────────────────────────────────┘"
echo
echo "  GET YOUR ANTHROPIC KEY AT: https://console.anthropic.com"
echo "  (Free \$5 credit on signup — enough for thousands of messages)"
echo
echo "  WANT FREE LOCAL AI INSTEAD? Use Ollama:"
echo "     LLM_PROVIDER = ollama"
echo "     LLM_MODEL    = qwen2.5"
echo "     LLM_BASE_URL = https://your-ollama-server.com/v1"
echo "     LLM_API_KEY  = (leave blank)"

pause

ask "Paste your Engine URL from Vercel (e.g. https://orbinex-abc123.vercel.app)"; read -r ENGINE_URL_RAW
ENGINE_URL="${ENGINE_URL_RAW%/}"  # strip trailing slash
[[ "$ENGINE_URL" != https://* ]] && ENGINE_URL="https://$ENGINE_URL"
ok "Engine URL saved: $ENGINE_URL"

# Verify engine is live
info "Verifying engine health..."
HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$ENGINE_URL/health" 2>/dev/null || echo "000")
if [ "$HTTP" = "200" ]; then
  ok "Engine is live and responding! ✓"
else
  warn "Got HTTP $HTTP — engine may still be deploying. Continue anyway."
fi

# ═══════════════════════════════════════════════════════════════════
#  PART B — MCP SERVER on RAILWAY
# ═══════════════════════════════════════════════════════════════════

step "STEP 3 — Deploy MCP Server to Railway (your tools & knowledge base)"

echo "  The MCP server runs your tools: weather, calculator, document search etc."
echo
echo "  ┌─────────────────────────────────────────────────────────┐"
echo "  │  WHAT TO DO IN RAILWAY (takes ~5 minutes)              │"
echo "  │                                                         │"
echo "  │  1. Open → https://railway.app                         │"
echo "  │  2. Sign up / Login (GitHub login recommended)          │"
echo "  │  3. New Project → Deploy from GitHub Repo               │"
echo "  │  4. Select: $GITHUB_REPO"
echo "  │  5. Railway auto-detects Node.js — let it run           │"
echo "  │  6. Once deployed → click the service → Variables tab   │"
echo "  │     Add ALL of these:                                   │"
echo "  │                                                         │"
echo "  │     PORT                  = 3002                        │"
echo "  │     MCP_API_KEY           = orbinex-secret-2025         │"
echo "  │     WEATHER_ENABLED       = true                        │"
echo "  │     CITY_TOUR_ENABLED     = true                        │"
echo "  │     COUNTRY_INFO_ENABLED  = true                        │"
echo "  │     CURRENCY_ENABLED      = true                        │"
echo "  │     RAG_ENABLED           = false                       │"
echo "  │     WEATHER_UNITS         = metric                      │"
echo "  │     EXPERIENCE_API_ENABLED= true                        │"
echo "  │     EXPERIENCE_API_URL    = https://your-api.com/exp    │"
echo "  │                                                         │"
echo "  │  7. Settings → Networking → Generate Domain             │"
echo "  │  8. Copy the .railway.app URL                           │"
echo "  └─────────────────────────────────────────────────────────┘"
echo
echo "  RAILWAY ROOT DIRECTORY: Set to 'packages/mcp-server' if asked"
echo "  FREE TIER: 500 hours/month — enough for a real product"

pause

ask "Paste your MCP Server URL from Railway (e.g. https://orbinex-mcp.up.railway.app)"; read -r MCP_URL_RAW
MCP_URL="${MCP_URL_RAW%/}"
[[ "$MCP_URL" != https://* ]] && MCP_URL="https://$MCP_URL"
ok "MCP URL saved: $MCP_URL"

# Verify MCP
info "Verifying MCP server tools..."
HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$MCP_URL/tools" 2>/dev/null || echo "000")
if [ "$HTTP" = "200" ]; then
  TOOL_COUNT=$(curl -s --max-time 10 "$MCP_URL/tools" 2>/dev/null | grep -o '"name"' | wc -l || echo "?")
  ok "MCP server live! Found $TOOL_COUNT tools ✓"
else
  warn "Got HTTP $HTTP — MCP may still be starting up. Continue."
fi

# Now update Vercel with the MCP URL
echo
echo "  ┌─────────────────────────────────────────────────────────┐"
echo "  │  UPDATE VERCEL with your MCP URL                       │"
echo "  │                                                         │"
echo "  │  1. Go to your Vercel project → Settings → Env Vars    │"
echo "  │  2. Edit MCP_SERVER_URL → paste:                       │"
echo "  │     $MCP_URL"
echo "  │  3. Click Save                                          │"
echo "  │  4. Deployments → ... → Redeploy                       │"
echo "  └─────────────────────────────────────────────────────────┘"

pause
ok "Vercel updated with MCP URL"

# ═══════════════════════════════════════════════════════════════════
#  PART C — PLUGIN on CLOUDFLARE PAGES
# ═══════════════════════════════════════════════════════════════════

step "STEP 4 — Deploy Plugin JS to Cloudflare Pages (your CDN)"

echo "  This is what 'CDN' means: Cloudflare hosts your orbinex.js file"
echo "  on 200+ servers worldwide so it loads fast everywhere."
echo "  Customers put ONE <script> tag on their website — that's it."
echo
echo "  ┌─────────────────────────────────────────────────────────┐"
echo "  │  OPTION A — Direct Upload (fastest, 2 minutes)         │"
echo "  │                                                         │"
echo "  │  1. Go to → https://pages.cloudflare.com               │"
echo "  │  2. Create Account / Login (free)                       │"
echo "  │  3. Workers & Pages → Create → Pages → Upload assets    │"
echo "  │  4. Drag this file:                                     │"
echo "  │     packages/plugin/dist/orbinex.iife.js               │"
echo "  │  5. Give it any project name (e.g. orbinex-plugin)      │"
echo "  │  6. Click Deploy                                        │"
echo "  │  Your URL: https://orbinex-plugin.pages.dev/orbinex.iife.js │"
echo "  │                                                         │"
echo "  ├─────────────────────────────────────────────────────────┤"
echo "  │  OPTION B — Auto-deploy from GitHub (recommended)      │"
echo "  │                                                         │"
echo "  │  1. Workers & Pages → Create → Pages → Connect to Git  │"
echo "  │  2. Select: $GITHUB_REPO"
echo "  │  3. Build settings:                                     │"
echo "  │       Framework preset: None                            │"
echo "  │       Build command:   cd packages/plugin && npm i && npm run build │"
echo "  │       Output dir:      packages/plugin/dist             │"
echo "  │  4. Deploy — auto-rebuilds on every git push            │"
echo "  └─────────────────────────────────────────────────────────┘"

pause

ask "Paste your Cloudflare Pages URL (e.g. https://orbinex-plugin.pages.dev)"; read -r CF_URL_RAW
CF_BASE="${CF_URL_RAW%/}"
[[ "$CF_BASE" != https://* ]] && CF_BASE="https://$CF_BASE"
PLUGIN_URL="$CF_BASE/orbinex.iife.js"
ok "Plugin URL: $PLUGIN_URL"

HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$PLUGIN_URL" 2>/dev/null || echo "000")
if [ "$HTTP" = "200" ]; then
  ok "Plugin JS is live and loading! ✓"
else
  warn "Got HTTP $HTTP — Cloudflare may still be deploying."
fi

# ═══════════════════════════════════════════════════════════════════
#  FINAL SUMMARY
# ═══════════════════════════════════════════════════════════════════

step "🎉 DEPLOYMENT COMPLETE"

ok "Engine  → $ENGINE_URL"
ok "MCP     → $MCP_URL"
ok "Plugin  → $PLUGIN_URL"

echo
echo -e "${C}${B}  ┌─────────────────────────────────────────────────────────┐${X}"
echo -e "${C}${B}  │  EMBED ON ANY WEBSITE — copy this ONE snippet:          │${X}"
echo -e "${C}${B}  └─────────────────────────────────────────────────────────┘${X}"
echo
echo "  <!-- Paste anywhere in your HTML -->"
echo "  <script"
echo "    src=\"$PLUGIN_URL\""
echo "    data-tenant=\"my-company\""
echo "    data-engine=\"$ENGINE_URL\""
echo "    data-color=\"#6C5CE7\""
echo "    data-title=\"Support Chat\""
echo "    data-welcome=\"Hi! How can I help you today?\""
echo "  ></script>"
echo
echo "  That's it. No npm, no Node, no build step needed on their site."
echo "  Works on WordPress, Shopify, Wix, raw HTML — anything."
echo
echo -e "${C}${B}  Verify services are working:${X}"
echo "  curl $ENGINE_URL/health"
echo "  curl $MCP_URL/tools | head -5"
echo
echo -e "${C}${B}  Customisation options:${X}"
echo "  data-mode=\"bubble\"         → floating bubble (default)"
echo "  data-mode=\"panel\"          → embedded sidebar"
echo "  data-mode=\"fullpage\"       → full page chat"
echo "  data-position=\"bottom-left\" → move bubble to left side"
echo "  data-color=\"#your-hex\"     → match your brand color"
echo

# Save for reference
cat > .deployed << CONF
ENGINE_URL=$ENGINE_URL
MCP_URL=$MCP_URL
PLUGIN_URL=$PLUGIN_URL
DEPLOYED_AT=$(date)
CONF
ok "Config saved to .deployed for reference"
echo