# Orbinex User Guide

## What is Orbinex?
Orbinex is a pluggable AI chat platform that lets businesses embed an AI chatbot on any website. The chatbot connects to the company's own tools and data through an MCP (Model Context Protocol) server.

## Key Features
- Drop one JavaScript snippet onto any website to add a chat widget
- Connect any AI model: Claude, GPT-4, Gemini, or free local models via Ollama
- Add custom tools to the MCP server: database queries, API calls, document search
- Built-in RAG (Retrieval Augmented Generation) for searching internal documents
- Real-time weather information for any city worldwide

## How to Get Started
1. Install the Orbinex MCP server: npm install @orbinex/mcp-server
2. Configure your preferred AI model in the .env file
3. Add your custom tools to the tools/ directory
4. Embed the chat widget on your website with one script tag
5. Start answering customer questions automatically

## The Chat Widget
The chat widget supports three modes:
- Bubble mode: a floating button in the corner of the page
- Panel mode: an embedded sidebar panel
- Fullpage mode: a full-page chat interface

Customize the widget color, title, and welcome message using data attributes on the script tag.

## Pricing
Orbinex is open source. You only pay for the AI model API calls you use. With Ollama, you can run completely free local models with no API costs at all.
