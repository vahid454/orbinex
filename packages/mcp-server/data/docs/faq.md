# Frequently Asked Questions

## Is Orbinex free?
Yes, the Orbinex software is free and open source. If you use Ollama as your AI provider, there are zero API costs. If you use OpenAI or Anthropic, you pay their standard API rates.

## Which AI models are supported?
Orbinex supports Anthropic Claude (claude-sonnet-4, claude-haiku), OpenAI GPT (gpt-4o, gpt-4o-mini), Google Gemini (gemini-1.5-pro, gemini-1.5-flash), and any model running on Ollama such as llama3, mistral, phi3, and gemma2.

## How do I switch AI models?
Edit the .env file in packages/engine and change LLM_PROVIDER and LLM_MODEL. Restart the engine after making changes. No code changes required.

## What is the MCP server?
The MCP (Model Context Protocol) server is a small Node.js server that you deploy on your own infrastructure. It acts as a bridge between the AI model and your company's tools and data. You define tools as simple JavaScript functions.

## Can I use my own database?
Yes. In your MCP server tools, you can connect to any database using your existing database libraries. The tool handler is just a regular async JavaScript function.

## How does the RAG tool work?
Place your text or markdown files in the data/docs folder. The RAG tool uses Ollama to create embeddings (vector representations) of the text, stores them in a local JSON index, and performs similarity search when a question is asked. This lets the AI answer questions based on your specific documents.

## Is my data sent to external servers?
Only if you use an external AI provider like OpenAI or Anthropic. If you use Ollama, all processing happens on your own machine or server. The MCP server runs on your infrastructure and your data never leaves it.
