FROM node:20-alpine
WORKDIR /app
COPY package.json turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/engine/package.json ./packages/engine/
RUN npm install
COPY packages/shared ./packages/shared
COPY packages/engine ./packages/engine
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=packages/engine
EXPOSE 3001
CMD ["node", "packages/engine/dist/index.js"]
