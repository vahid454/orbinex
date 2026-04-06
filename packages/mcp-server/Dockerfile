FROM node:20-alpine
WORKDIR /app
COPY package.json turbo.json ./
COPY packages/shared/package.json    ./packages/shared/
COPY packages/mcp-server/package.json ./packages/mcp-server/
RUN npm install
COPY packages/shared    ./packages/shared
COPY packages/mcp-server ./packages/mcp-server
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=packages/mcp-server
EXPOSE 3002
CMD ["node", "packages/mcp-server/dist/index.js"]
