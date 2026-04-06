import { defineConfig } from 'vite'

export default defineConfig({
  server: { port: 5173 },
  // In dev mode Vite serves index.html and transpiles src/entry.ts on the fly.
  // `npm run build` produces dist/orbinex.iife.js from src/index.ts.
  build: {
    lib: {
      entry:    'src/index.ts',
      name:     'Orbinex',
      fileName: 'orbinex',
      formats:  ['iife'],
    },
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
  },
})
