import fs from 'fs'
import path from 'path'
import config from '../config'
import type { OrbinexTool } from '../lib/types'

// ─── Types ───────────────────────────────────────────────────
interface Chunk {
  id: string
  text: string
  source: string   // filename
  embedding?: number[]
}

interface RagIndex {
  chunks: Chunk[]
  builtAt: string
}

// ─── Ollama helpers ──────────────────────────────────────────
async function ollamaEmbed(text: string): Promise<number[]> {
  const res = await fetch(`${config.rag.ollamaBaseUrl}/api/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: config.rag.embeddingModel, input: text }),
  })
  if (!res.ok) throw new Error(`Ollama embed failed: ${res.status} — is Ollama running? (ollama serve)`)
  const data = await res.json() as any
  // Ollama /api/embed returns { embeddings: [[...]] }
  return data.embeddings?.[0] ?? data.embedding ?? []
}

async function ollamaGenerate(prompt: string): Promise<string> {
  const res = await fetch(`${config.rag.ollamaBaseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.rag.generationModel,
      prompt,
      stream: false,
    }),
  })
  if (!res.ok) throw new Error(`Ollama generate failed: ${res.status}`)
  const data = await res.json() as any
  return data.response ?? ''
}

// ─── Cosine similarity ───────────────────────────────────────
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dot / denom
}

// ─── Text chunking ───────────────────────────────────────────
function chunkText(text: string, chunkSize = 400, overlap = 80): string[] {
  const words  = text.split(/\s+/)
  const chunks: string[] = []
  let i = 0
  while (i < words.length) {
    chunks.push(words.slice(i, i + chunkSize).join(' '))
    i += chunkSize - overlap
  }
  return chunks.filter(c => c.trim().length > 20)
}

// ─── Index builder ───────────────────────────────────────────
async function buildIndex(): Promise<RagIndex> {
  const docsPath = path.resolve(config.rag.docsPath)

  if (!fs.existsSync(docsPath)) {
    fs.mkdirSync(docsPath, { recursive: true })
    // Create a sample doc so the tool works out of the box
    fs.writeFileSync(path.join(docsPath, 'sample.md'), `# Orbinex Documentation

## What is Orbinex?
Orbinex is a pluggable AI chat platform. It lets you embed a chatbot on any website and connect it to your own tools via an MCP server.

## How to add a tool
Create a new file in packages/mcp-server/src/tools/ and export an OrbinexTool object with a name, description, parameters, and handler function.

## Supported AI providers
Orbinex supports Anthropic Claude, OpenAI GPT, Google Gemini, and Ollama (free local models).

## The RAG tool
The RAG tool lets the AI answer questions based on your own documents. Place .txt or .md files in the data/docs folder and run the index build command.
`)
    console.log('📄 Created sample doc at data/docs/sample.md')
  }

  const files = fs.readdirSync(docsPath).filter(f => /\.(txt|md)$/.test(f))
  if (files.length === 0) throw new Error(`No .txt or .md files found in ${docsPath}`)

  console.log(`🔨 Building RAG index from ${files.length} file(s)...`)
  const chunks: Chunk[] = []

  for (const file of files) {
    const text   = fs.readFileSync(path.join(docsPath, file), 'utf-8')
    const parts  = chunkText(text)
    for (let i = 0; i < parts.length; i++) {
      const embedding = await ollamaEmbed(parts[i])
      chunks.push({ id: `${file}:${i}`, text: parts[i], source: file, embedding })
      process.stdout.write(`
  embedded ${chunks.length} chunks...`)
    }
  }

  console.log(`
✅ Index built: ${chunks.length} chunks`)
  const index: RagIndex = { chunks, builtAt: new Date().toISOString() }
  fs.writeFileSync(path.resolve(config.rag.indexPath), JSON.stringify(index))
  return index
}

// ─── Load or build index ─────────────────────────────────────
let cachedIndex: RagIndex | null = null

async function getIndex(): Promise<RagIndex> {
  if (cachedIndex) return cachedIndex
  const indexPath = path.resolve(config.rag.indexPath)
  if (fs.existsSync(indexPath)) {
    cachedIndex = JSON.parse(fs.readFileSync(indexPath, 'utf-8')) as RagIndex
    console.log(`📚 RAG index loaded (${cachedIndex.chunks.length} chunks, built ${cachedIndex.builtAt})`)
    return cachedIndex
  }
  cachedIndex = await buildIndex()
  return cachedIndex
}

// ─── RAG query ───────────────────────────────────────────────
async function ragQuery(question: string): Promise<string> {
  const index = await getIndex()
  const qEmbedding = await ollamaEmbed(question)

  // Score all chunks
  const scored = index.chunks
    .filter(c => c.embedding && c.embedding.length > 0)
    .map(c => ({ chunk: c, score: cosineSimilarity(qEmbedding, c.embedding!) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, config.rag.topK)

  if (scored.length === 0) return 'No relevant documents found.'

  const context = scored
    .map((s, i) => `[${i + 1}] (from ${s.chunk.source}):\n${s.chunk.text}`)
    .join('\n\n')

  const prompt = `You are a helpful assistant. Answer the question based ONLY on the context below.
If the answer is not in the context, say "I don't have information about that in my documents."

Context:
${context}

Question: ${question}

Answer:`

  return ollamaGenerate(prompt)
}

// ─── Exported tool ───────────────────────────────────────────
export const ragTool: OrbinexTool = {
  name: 'search_documents',
  description: "Search through the company's internal documents and knowledge base to answer questions. Use this when the user asks about internal policies, product details, procedures, or any company-specific information.",
  parameters: {
    question: {
      type: 'string',
      description: 'The question to answer from the documents',
      required: true,
    },
  },
  handler: async ({ question }) => {
    const answer = await ragQuery(String(question))
    return { answer, source: 'internal documents (RAG)' }
  },
}

// ─── Index rebuild tool ───────────────────────────────────────
export const rebuildIndexTool: OrbinexTool = {
  name: 'rebuild_document_index',
  description: 'Rebuild the document search index after new documents have been added to the docs folder.',
  parameters: {},
  handler: async () => {
    cachedIndex = null
    const index = await buildIndex()
    return { message: `Index rebuilt successfully with ${index.chunks.length} chunks.` }
  },
}