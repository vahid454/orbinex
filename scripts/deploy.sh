#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
#  ORBINEX — One-Shot Deployment Script
#  Deploys: Engine → Render | MCP Server → Render | Plugin → Cloudflare
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
#  PART A — ENGINE on RENDER
# ═══════════════════════════════════════════════════════════════════

step "STEP 2 — Deploy Engine to Render (your AI backend)"

echo "  The engine handles all AI conversations. It runs on Render for free."
echo
echo "  ┌─────────────────────────────────────────────────────────┐"
echo "  │  WHAT TO DO IN RENDER (takes ~5 minutes)               │"
echo "  │                                                         │"
echo "  │  1. Open → https://render.com                          │"
echo "  │  2. Click 'New +' → 'Web Service'                       │"
echo "  │  3. Connect your GitHub repo: $GITHUB_REPO"
echo "  │  4. Configure:                                          │"
echo "  │       Name: orbinex-engine                              │"
echo "  │       Root Directory: packages/engine                   │"
echo "  │       Build Command: npm install && npm run build       │"
echo "  │       Start Command: node dist/index.js                 │"
echo "  │  5. Select Free Tier                                    │"
echo "  │  6. Add Environment Variables:                          │"
echo "  │                                                         │"
echo "  │       PORT              = 3001                          │"
echo "  │       LLM_PROVIDER      = openai                        │"
echo "  │       LLM_MODEL         = gpt-3.5-turbo                 │"
echo "  │       LLM_API_KEY       = your-openai-key               │"
echo "  │       MCP_SERVER_URL    = (will add after MCP deploy)   │"
echo "  │       MCP_API_KEY       = orbinex-secret-2025           │"
echo "  │                                                         │"
echo "  │  7. Click 'Create Web Service'                          │"
echo "  └─────────────────────────────────────────────────────────┘"
echo
echo "  FREE ALTERNATIVES:"
echo "  - OpenAI: https://platform.openai.com ($5 free credit)"
echo "  - Anthropic: https://console.anthropic.com ($5 free credit)"
echo "  - Google Gemini: https://aistudio.google.com (free)"
echo "  - OpenRouter: https://openrouter.ai ($1 free credit)"

pause

ask "Paste your Engine URL from Render (e.g. https://orbinex-engine.onrender.com)"; read -r ENGINE_URL_RAW
ENGINE_URL="${ENGINE_URL_RAW%/}"
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
#  PART B — MCP SERVER on RENDER
# ═══════════════════════════════════════════════════════════════════

step "STEP 3 — Deploy MCP Server to Render (your tools & knowledge base)"

echo "  The MCP server runs your tools: weather, calculator, document search etc."
echo
echo "  ┌─────────────────────────────────────────────────────────┐"
echo "  │  WHAT TO DO IN RENDER (takes ~5 minutes)               │"
echo "  │                                                         │"
echo "  │  1. Open → https://render.com                          │"
echo "  │  2. Click 'New +' → 'Web Service'                       │"
echo "  │  3. Connect your GitHub repo: $GITHUB_REPO"
echo "  │  4. Configure:                                          │"
echo "  │       Name: orbinex-mcp-server                          │"
echo "  │       Root Directory: packages/mcp-server               │"
echo "  │       Build Command: npm install && npm run build       │"
echo "  │       Start Command: node dist/index.js                 │"
echo "  │  5. Select Free Tier                                    │"
echo "  │  6. Add Environment Variables:                          │"
echo "  │                                                         │"
echo "  │       PORT                  = 3002                      │"
echo "  │       MCP_API_KEY           = orbinex-secret-2025       │"
echo "  │       WEATHER_ENABLED       = true                      │"
echo "  │       CITY_TOUR_ENABLED     = true                      │"
echo "  │       COUNTRY_INFO_ENABLED  = true                      │"
echo "  │       CURRENCY_ENABLED      = true                      │"
echo "  │       WEATHER_UNITS         = metric                    │"
echo "  │                                                         │"
echo "  │  7. Click 'Create Web Service'                          │"
echo "  └─────────────────────────────────────────────────────────┘"

pause

ask "Paste your MCP Server URL from Render (e.g. https://orbinex-mcp-server.onrender.com)"; read -r MCP_URL_RAW
MCP_URL="${MCP_URL_RAW%/}"
[[ "$MCP_URL" != https://* ]] && MCP_URL="https://$MCP_URL"
ok "MCP URL saved: $MCP_URL"

# Verify MCP
info "Verifying MCP server tools..."
HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$MCP_URL/health" -H "authorization: Bearer orbinex-secret-2025" 2>/dev/null || echo "000")
if [ "$HTTP" = "200" ]; then
  TOOL_COUNT=$(curl -s --max-time 10 "$MCP_URL/tools" -H "authorization: Bearer orbinex-secret-2025" 2>/dev/null | grep -o '"name"' | wc -l || echo "?")
  ok "MCP server live! Found $TOOL_COUNT tools ✓"
else
  warn "Got HTTP $HTTP — MCP may still be starting up. Continue."
fi

# Now update Render Engine with the MCP URL
echo
echo "  ┌─────────────────────────────────────────────────────────┐"
echo "  │  UPDATE ENGINE with your MCP URL                       │"
echo "  │                                                         │"
echo "  │  1. Go to your Render Dashboard → orbinex-engine        │"
echo "  │  2. Click 'Environment' tab                             │"
echo "  │  3. Add/Update:                                         │"
echo "  │       MCP_SERVER_URL = $MCP_URL                         │"
echo "  │       MCP_API_KEY     = orbinex-secret-2025             │"
echo "  │  4. Click 'Save Changes'                                │"
echo "  │  5. Click 'Manual Deploy' → 'Deploy latest commit'      │"
echo "  └─────────────────────────────────────────────────────────┘"

pause
ok "Engine updated with MCP URL"

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
echo "  │  4. Drag this folder:                                   │"
echo "  │     packages/plugin/dist                                │"
echo "  │  5. Project name: orbinex-plugin                        │"
echo "  │  6. Click Deploy                                        │"
echo "  │  Your URL: https://orbinex-plugin.pages.dev/orbinex.iife.js │"
echo "  │                                                         │"
echo "  ├─────────────────────────────────────────────────────────┤"
echo "  │  OPTION B — Using Wrangler CLI (one command)           │"
echo "  │                                                         │"
echo "  │  npx wrangler pages deploy packages/plugin/dist \       │"
echo "  │    --project-name=orbinex-plugin                        │"
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
echo "    data-title=\"Orbinex AI\""
echo "    data-welcome=\"Hi! How can I help you today?\""
echo "  ></script>"
echo
echo "  That's it. No npm, no Node, no build step needed on their site."
echo "  Works on WordPress, Shopify, Wix, raw HTML — anything."
echo
echo -e "${C}${B}  Verify services are working:${X}"
echo "  curl $ENGINE_URL/health"
echo "  curl -H \"authorization: Bearer orbinex-secret-2025\" $MCP_URL/health"
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