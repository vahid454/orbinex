#!/usr/bin/env node
/**
 * Orbinex Quick Setup Script
 * Initializes and deploys Orbinex chatbot
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.blue}${msg}${colors.reset}\n`),
};

async function setup() {
  log.header('🚀 Orbinex Setup Wizard');

  // Step 1: Check dependencies
  log.info('Checking dependencies...');
  try {
    execSync('npm --version', { stdio: 'ignore' });
    execSync('node --version', { stdio: 'ignore' });
    log.success('Dependencies installed');
  } catch (e) {
    log.error('Node.js and npm are required');
    process.exit(1);
  }

  // Step 2: Create docs directory
  log.info('Setting up document directory...');
  const docsDir = path.join(__dirname, '../packages/mcp-server/data/docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
    log.success('Created docs directory');
  }

  // Step 3: Create sample documents
  const sampleDocs = [
    {
      file: 'getting-started.md',
      content: `# Getting Started with Orbinex

Orbinex is an AI chatbot that can be embedded in any website.

## Features
- Real-time chat
- Document-based answers (RAG)
- Voice input support
- Conversation history
- Self-hosted or cloud deployment

## Quick Start

1. Add the script tag to your website
2. Configure with your API endpoint
3. Start chatting!`
    },
    {
      file: 'faq.md',
      content: `# Frequently Asked Questions

## How do I install Orbinex?
Just add a script tag with your API endpoint and tenant ID.

## Can I customize the appearance?
Yes! Customize colors, position, title, and more via config.

## Does it support multiple languages?
Yes, the underlying model supports many languages.

## Where is my data stored?
Data is stored on your server/database. You control everything.`
    }
  ];

  sampleDocs.forEach(({ file, content }) => {
    const filePath = path.join(docsDir, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content);
      log.success(`Created ${file}`);
    }
  });

  // Step 4: Create RAG index builder
  log.info('Creating RAG index builder...');
  const scriptContent = `const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../packages/mcp-server/data/docs');
const outputFile = path.join(__dirname, '../packages/mcp-server/data/rag-index.json');

const docs = [];
const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'));

files.forEach((file, idx) => {
  const content = fs.readFileSync(path.join(docsDir, file), 'utf-8');
  docs.push({
    id: \`doc-\${idx}\`,
    title: file.replace('.md', ''),
    path: \`docs/\${file}\`,
    content: content,
    tags: ['custom', 'local']
  });
});

fs.writeFileSync(outputFile, JSON.stringify({ docs }, null, 2));
console.log(\`✓ Built RAG index with \${docs.length} documents\`);
`;

  const scriptPath = path.join(__dirname, '../scripts/build-rag-index.js');
  fs.mkdirSync(path.dirname(scriptPath), { recursive: true });
  fs.writeFileSync(scriptPath, scriptContent);
  log.success('Created build-rag-index.js');

  // Step 5: Build RAG index
  log.info('Building RAG index...');
  try {
    execSync('node scripts/build-rag-index.js', {
      cwd: path.join(__dirname, '..')
    });
    log.success('RAG index built');
  } catch (e) {
    log.warn('Could not build RAG index automatically');
  }

  // Step 6: Summary
  log.header('✓ Setup Complete!');
  console.log('Next steps:

1. Add your documents to: packages/mcp-server/data/docs/

2. Build the project:
   npm run build

3. Start development:
   npm run dev

4. Deploy:
   - Vercel:   vercel deploy --prod
   - Railway:  railway up --detach
   - Docker:   docker compose up -d
   - CDN:      npm publish && use unpkg.com

5. Add to your website:
   <script src="https://unpkg.com/@orbinex/plugin@latest/dist/orbinex.iife.js"></script>
   <script>
     window.orbinexConfig = {
       engineUrl: "https://your-api.com",
       tenantId: "your-tenant",
       primaryColor: "#6C5CE7"
     };
   </script>

For more info, see: DEPLOYMENT.md

Happy coding! 🎉');
}

setup().catch(err => {
  log.error(err.message);
  process.exit(1);
});
