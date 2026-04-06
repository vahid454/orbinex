import 'dotenv/config'
import { buildMcpServer } from './server'
import { weatherTool }          from './tools/weather'
import { ragTool, rebuildIndexTool } from './tools/rag'
import { cityTourTool }         from './tools/cityTour'
import { countryCapitalTool }   from './tools/countryCapital'
import { currencyTool }         from './tools/currency'
import { experienceTool }       from './tools/experience'
import config from './config'

async function main() {
  const tools = [
    ...(config.weather.enabled        ? [weatherTool]                      : []),
    ...(config.rag.enabled            ? [ragTool, rebuildIndexTool]         : []),
    ...(config.cityTour.enabled       ? [cityTourTool]                     : []),
    ...(config.countryCapital.enabled ? [countryCapitalTool]               : []),
    ...(config.currency.enabled       ? [currencyTool]                     : []),
    ...(config.experienceApi.enabled  ? [experienceTool]                   : []),
    // ─── Add your own tools here ─────────────────────────────────
    // import { myTool } from './tools/myTool'
    // ...(config.myFeature.enabled ? [myTool] : []),
  ]

  const app = await buildMcpServer({ tools })
  await app.listen({ port: config.port, host: '0.0.0.0' })

  const pad = (s: string) => s.padEnd(28)
  console.log('\n🔧 Orbinex MCP Server started')
  console.log('─'.repeat(50))
  for (const t of tools) {
    console.log(`  ✓ ${pad(t.name)}${t.description.slice(0, 38)}…`)
  }
  console.log('─'.repeat(50))
  console.log(`  Weather:     ${config.weather.apiKey ? 'OpenWeatherMap' : 'open-meteo (free, no key)'}`)
  console.log(`  RAG model:   ${config.rag.generationModel} via ${config.rag.ollamaBaseUrl}`)
  console.log(`  Exp API:     ${config.experienceApi.url ?? 'disabled'}`)
  console.log(`  Auth:        ${config.apiKey ? 'enabled' : 'disabled'}`)
  console.log('\n')
}

main().catch((err) => {
  console.error('Fatal startup error:', err)
  process.exit(1)
})
