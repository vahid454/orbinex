import 'dotenv/config'
import { buildMcpServer }             from './server'
import { weatherTool }                from './tools/weather'
import { ragTool, rebuildIndexTool }  from './tools/rag'
import { cityTourTool }               from './tools/cityTour'
import { countryCapitalTool }         from './tools/countryCapital'
import { currencyTool }               from './tools/currency'
import { experienceTool }             from './tools/experience'
import { calculatorTool }             from './tools/calculator'
import { datetimeTool }               from './tools/datetime'
import { newsTool }                   from './tools/news'
import { unitConverterTool }          from './tools/unitConverter'
import config from './config'

async function main() {
  const tools = [
    // ── Always-on (no config needed) ─────────────────────────
    calculatorTool,
    datetimeTool,
    unitConverterTool,

    // ── Configurable ─────────────────────────────────────────
    ...(config.weather.enabled        ? [weatherTool]                    : []),
    ...(config.cityTour.enabled       ? [cityTourTool]                   : []),
    ...(config.countryCapital.enabled ? [countryCapitalTool]             : []),
    ...(config.currency.enabled       ? [currencyTool]                   : []),
    ...(config.rag.enabled            ? [ragTool, rebuildIndexTool]       : []),
    ...(config.experienceApi.enabled  ? [experienceTool]                 : []),
    newsTool,

    // ── Add your own tools here ───────────────────────────────
    // import { myTool } from './tools/myTool'
    // myTool,
  ]

  const app = await buildMcpServer({ tools })
  await app.listen({ port: config.port, host: '0.0.0.0' })

  const pad = (s: string) => s.padEnd(30)
  console.log('\n🔧 Orbinex MCP Server')
  console.log('─'.repeat(52))
  tools.forEach(t => console.log(`  ✓ ${pad(t.name)}${t.description.slice(0, 30)}…`))
  console.log('─'.repeat(52))
  console.log(`  Port:    ${config.port}`)
  console.log(`  Weather: ${config.weather.apiKey ? 'OpenWeatherMap' : 'open-meteo (free)'}`)
  console.log(`  RAG:     ${config.rag.generationModel} @ ${config.rag.ollamaBaseUrl}`)
  console.log(`  Exp API: ${config.experienceApi.url ?? 'disabled'}\n`)
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })