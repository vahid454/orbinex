import 'dotenv/config'
import { buildApp } from './app'

const PORT = Number(process.env.PORT ?? 3001)

async function main() {
  const app = await buildApp()
  await app.listen({ port: PORT, host: '0.0.0.0' })
  console.log(`🚀 Orbinex Engine running on http://localhost:${PORT}`)
}

main().catch((err) => {
  console.error('Fatal startup error:', err)
  process.exit(1)
})
