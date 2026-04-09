import type { OrbinexTool } from '../lib/types'

// REST Countries API — completely free, no key
async function getCountryInfo(query: string) {
  // Try by name first, then by capital
  const byName = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(query)}?fullText=false`)
  if (byName.ok) {
    const data = await byName.json() as any[]
    if (data.length) return data[0]
  }
  const byCap = await fetch(`https://restcountries.com/v3.1/capital/${encodeURIComponent(query)}`)
  if (byCap.ok) {
    const data = await byCap.json() as any[]
    if (data.length) return data[0]
  }
  return null
}

export const countryCapitalTool: OrbinexTool = {
  name: 'get_country_info',
  description: 'Get information about any country — capital city, population, currency, languages, flag, and region. You can search by country name or capital city.',
  parameters: {
    query: {
      type: 'string',
      description: 'Country name (e.g. "France") or capital city (e.g. "Paris")',
      required: true,
    },
  },
  handler: async ({ query }) => {
    const info = await getCountryInfo(String(query))
    if (!info) return { error: `No country found for "${query}"` }

    const currencies = Object.values(info.currencies ?? {}) as any[]
    const languages  = Object.values(info.languages  ?? {}) as string[]

    return {
      name:        info.name?.common,
      officialName: info.name?.official,
      capital:     info.capital?.[0] ?? 'No capital',
      region:      info.region,
      subregion:   info.subregion,
      population:  `${(info.population / 1_000_000).toFixed(1)}M`,
      area:        `${info.area?.toLocaleString()} km²`,
      currencies:  currencies.map((c: any) => `${c.name} (${c.symbol})`).join(', '),
      languages:   languages.join(', '),
      flag:        info.flag,         // emoji flag e.g. 🇫🇷
      flagImage:   info.flags?.png,
      timezones:   info.timezones?.slice(0, 3).join(', '),
      callingCode: `+${info.idd?.root?.replace('+','')}${info.idd?.suffixes?.[0] ?? ''}`,
    }
  },
}
