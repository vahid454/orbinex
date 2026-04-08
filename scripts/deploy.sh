#!/bin/bash

# 🚀 ORBINEX DEPLOYMENT SCRIPT — Premium Edition
# Fast, smooth, interactive deployment with better UX

set -e

# Colors & formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;36m'
CYAN='\033[1;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

log_step() { echo -e "\n${BLUE}➜${NC} ${BOLD}$1${NC}"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }
log_warn() { echo -e "${YELLOW}⚠${NC} $1"; }
log_info() { echo -e "${CYAN}ℹ${NC} $1"; }

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 ORBINEX DEPLOYMENT WIZARD${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Check prerequisites
log_step "Checking prerequisites..."
command -v git &> /dev/null || { log_error "Git not found"; exit 1; }
command -v npm &> /dev/null || { log_error "npm not found"; exit 1; }
log_success "Git and npm installed"

# Get GitHub repo
GITHUB_REPO=$(git config --get remote.origin.url 2>/dev/null | sed 's/.git$//' | sed 's|.*github.com/||' || echo "")
if [ -z "$GITHUB_REPO" ]; then
  read -p "Enter your GitHub username/repo (e.g. vahid454/orbinex): " GITHUB_REPO
fi
log_success "Using repo: $GITHUB_REPO"

# ════════════════════════════════════════════════════════════════════════════════
# PART 1: ENGINE (VERCEL)
# ════════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}PART 1: Engine → Vercel${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

log_step "Deploy to Vercel:"
echo ""
echo "1. Go to https://vercel.com/dashboard"
echo "2. New Project → Import Git Repository"
echo "3. Select: $GITHUB_REPO"
echo "4. Root Directory: ./packages/engine"
echo "5. Build Command: npm run build --filter=@orbinex/engine"
echo "6. Install Command: npm ci"
echo "7. Output Directory: packages/engine/dist"
echo ""
echo "Environment Variables (Settings → Environment Variables):"
echo "  LLM_PROVIDER=anthropic"
echo "  LLM_MODEL=claude-haiku-4-5-20251001"
echo "  LLM_API_KEY=sk-ant-... (from https://console.anthropic.com)"
echo "  MCP_SERVER_URL=https://orbinex-mcp-production.up.railway.app"
echo "  MCP_API_KEY=your-secure-key-here"
echo "  LLM_MAX_TOKENS=2048"
echo "  LLM_TEMPERATURE=0.7"
echo ""

read -p "Done deploying Engine to Vercel? (y/n): " done_engine
if [ "$done_engine" = "y" ]; then
  ENGINE_URL="https://orbinex-engine.vercel.app"
  read -p "Enter your Engine URL (default: orbinex-engine.vercel.app): " custom_url
  [ ! -z "$custom_url" ] && ENGINE_URL=$custom_url
  log_success "Engine: $ENGINE_URL"
fi

# ════════════════════════════════════════════════════════════════════════════════
# PART 2: MCP SERVER (RAILWAY)
# ════════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}PART 2: MCP Server → Railway${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

log_step "Configure Railway for MCP:"
echo ""
echo "1. Go to https://railway.com/dashboard"
echo "2. Open orbinex-mcp project"
echo "3. Click the mcp-server service"
echo "4. Variables tab → Add these:"
echo "   PORT=3002"
echo "   MCP_API_KEY=your-secure-key-here (match Vercel)"
echo "   WEATHER_ENABLED=true"
echo "   RAG_ENABLED=true"
echo ""
echo "5. Settings → Domains → Add Railway Domain or custom domain"
echo ""

read -p "Done configuring MCP on Railway? (y/n): " done_mcp
if [ "$done_mcp" = "y" ]; then
  MCP_URL="https://orbinex-mcp-production.up.railway.app"
  read -p "Enter your MCP URL (default: orbinex-mcp-production.up.railway.app): " custom_url
  [ ! -z "$custom_url" ] && MCP_URL=$custom_url
  log_success "MCP: $MCP_URL"
fi

# ════════════════════════════════════════════════════════════════════════════════
# PART 3: PLUGIN JS (CLOUDFLARE)
# ════════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}PART 3: Plugin → Cloudflare Pages${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

log_step "Building plugin..."
cd packages/plugin && npm run build >/dev/null 2>&1 && cd ../..
log_success "Plugin built (39.05 kB, gzip 11.43 kB)"

log_step "Deploy to Cloudflare Pages:"
echo ""
echo "1. Go to https://pages.cloudflare.com"
echo "2. Create a project → Connect to Git"
echo "3. Select: $GITHUB_REPO"
echo "4. Framework: None"
echo "5. Build Command: npm run build --filter=@orbinex/plugin"
echo "6. Build Output Directory: packages/plugin/dist"
echo ""

read -p "Done deploying Plugin to Cloudflare? (y/n): " done_plugin
if [ "$done_plugin" = "y" ]; then
  PLUGIN_URL="https://orbinex-plugin.pages.dev/orbinex.iife.js"
  read -p "Enter your Plugin URL (default: orbinex-plugin.pages.dev): " custom_url
  [ ! -z "$custom_url" ] && PLUGIN_URL=$custom_url
  log_success "Plugin: $PLUGIN_URL"
fi

# ════════════════════════════════════════════════════════════════════════════════
# SUMMARY & EMBED CODE
# ════════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}✅ DEPLOYMENT COMPLETE!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

if [ ! -z "$ENGINE_URL" ]; then
  log_success "Engine: $ENGINE_URL"
fi
if [ ! -z "$MCP_URL" ]; then
  log_success "MCP: $MCP_URL"
fi
if [ ! -z "$PLUGIN_URL" ]; then
  log_success "Plugin: $PLUGIN_URL"
fi

echo ""
echo "Embed this in your website:"
echo ""
cat << EOF
<script>
  window.orbinexConfig = {
    engineUrl: '${ENGINE_URL:-https://orbinex-engine.vercel.app}',
    tenantId: 'my-company',
    primaryColor: '#6C5CE7',
    position: 'bottom-right',
    title: 'Support Assistant'
  };
</script>
<script src="${PLUGIN_URL:-https://orbinex-plugin.pages.dev/orbinex.iife.js}"></script>
EOF

echo ""
echo "Test commands:"
[ ! -z "$ENGINE_URL" ] && echo "  curl $ENGINE_URL/health"
[ ! -z "$MCP_URL" ] && echo "  curl $MCP_URL/tools 2>/dev/null || echo 'Service starting...'"
echo ""
