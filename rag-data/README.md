# 📚 RAG Data Directory

This directory contains training data, documentation, and knowledge bases for Orbinex's Retrieval-Augmented Generation (RAG) system.

## 📁 Structure

```
rag-data/
├── README.md (this file)
├── company/ (Company knowledge base)
├── products/ (Product documentation)
├── faq/ (Frequently asked questions)
├── blog/ (Blog posts and articles)
├── legal/ (Terms, privacy, policies)
└── custom/ (Your custom data)
```

## 📝 Supported Formats

- **Markdown** (.md) - Recommended
- **Text** (.txt)
- **PDF** (.pdf)
- **JSON** (.json) - For structured data

## 🚀 How to Add Data

### Method 1: Direct File Upload
1. Place files in appropriate subdirectories
2. Use **Markdown (.md)** format for best results
3. Restart the RAG indexer: `npm run rag:index`

### Method 2: Chat Upload
Users can upload files directly through the chat interface:
- Click the upload icon in the chat
- Select PDF, TXT, or MD files
- AI will automatically index and learn from it

### Method 3: API Integration
```bash
curl -X POST http://localhost:3002/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "ingest_document",
    "parameters": {
      "filename": "myfile.md",
      "content": "File content here..."
    }
  }'
```

## 📚 Example: Adding Company Info

Create `rag-data/company/overview.md`:
```markdown
# Company Overview

## About Us
Orbinex is an enterprise AI platform...

## History
Founded in 2024...

## Team
- CEO: John Doe
- CTO: Jane Smith
...
```

## 🔍 How RAG Works

1. **Ingestion**: Documents are read and chunked
2. **Embedding**: Text is converted to vector embeddings
3. **Indexing**: Vectors are stored for fast retrieval
4. **Retrieval**: User queries find relevant chunks
5. **Generation**: AI uses retrieved context to answer

## ⚙️ Indexing & Management

### Auto-Index (Recommended)
Files in `rag-data/` are automatically indexed on startup.

### Manual Index
```bash
cd packages/mcp-server
npm run rag:index
```

### Clear Old Data
```bash
npm run rag:reset
# Then re-index: npm run rag:index
```

### Check Index Status
```bash
curl http://localhost:3002/rag/status
```

## 🔒 Privacy & Security

- RAG data is stored locally (no external indexing)
- Files are processed serverside only
- No data is sent to third parties
- Use `.ragignore` to exclude sensitive files

`.ragignore` example:
```
**/*.secret
**/passwords.md
private/**
```

## 💡 Best Practices

### Formatting
- Use clear headings (# Main, ## Sub)
- Keep paragraphs short (2-3 sentences)
- Use lists for structured info
- Add metadata headers:
  ```markdown
  ---
  title: Product Name
  category: products
  updated: 2024-04-08
  ---
  ```

### Content Organization
- **Keep files focused** - One topic per file
- **Use consistent naming** - `product-name.md` not `PROD NAME.txt`
- **Add context** - Include company/product references
- **Update regularly** - Mark outdated content with ⚠️

### Performance
- Recommended max file size: 500 KB
- Recommended total index: < 50 MB
- Chunks are ~400 tokens each (auto-split)

## 📊 Advanced Configuration

Edit `packages/mcp-server/.env`:
```env
# RAG Settings
RAG_ENABLED=true
RAG_CHUNK_SIZE=400
RAG_CHUNK_OVERLAP=50
RAG_MIN_SCORE=0.5
RAG_MAX_RESULTS=5

# Vector Store
VECTOR_STORE=local  # or 'pinecone', 'qdrant'
```

## 🎯 Sample Directories

- `company/` → Company policies, values, history
- `products/` → Product specs, features, pricing
- `faq/` → Common questions and answers
- `blog/` → Content marketing, announcements
- `legal/` → Terms of service, privacy policy
- `custom/` → Your domain-specific knowledge

## 📈 Monitoring RAG Quality

Watch for these in responses:
- ✅ Accurate citations from your data
- ✅ Contextual, relevant answers
- ❌ Hallucinations (check source files)
- ❌ Outdated information (refresh files)

## 🆘 Troubleshooting

**Q: AI doesn't know about my data**
- Ensure files are in `rag-data/` subdirectories
- Run `npm run rag:index`
- Check file format (MD/TXT/PDF)

**Q: Responses are slow**
- Large index slowing retrieval
- Reduce max files or chunk size
- Check system memory

**Q: RAG not working at all**
- Verify `RAG_ENABLED=true`
- Check logs: `docker logs orbinex-mcp`
- Rebuild index: `npm run rag:reset && npm run rag:index`

## 📞 Support

- Docs: https://orbinex.dev/docs/rag
- Issues: https://github.com/orbinex/orbinex/issues
- Discord: https://discord.gg/orbinex

---

**Last Updated:** April 2024
**RAG Version:** 2.0
