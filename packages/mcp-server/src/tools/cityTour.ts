import type { OrbinexTool } from '../lib/types'

// Uses Wikipedia summary API — completely free, no key needed
async function getWikiSummary(title: string): Promise<string> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  const res = await fetch(url, { headers: { 'User-Agent': 'OrbinexBot/1.0' } })
  if (!res.ok) return 'No Wikipedia summary found.'
  const data = await res.json() as any
  return data.extract ?? 'No description available.'
}

// Open-Meteo geocoding — free, no key
async function geocodeCity(city: string): Promise<{ lat: number; lon: number; country: string; population?: number } | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
  const res = await fetch(url)
  const data = await res.json() as any
  if (!data.results?.length) return null
  const r = data.results[0]
  return { lat: r.latitude, lon: r.longitude, country: r.country ?? '', population: r.population }
}

export const cityTourTool: OrbinexTool = {
  name: 'get_city_tour',
  description: 'Get a travel guide and information about any city in the world — description, location, country, population, and highlights.',
  parameters: {
    city: {
      type: 'string',
      description: 'City name, e.g. "Paris", "Tokyo", "Mumbai"',
      required: true,
    },
  },
  handler: async ({ city }) => {
    const cityStr = String(city)
    const [geo, summary] = await Promise.all([
      geocodeCity(cityStr),
      getWikiSummary(cityStr),
    ])

    return {
      city: cityStr,
      country: geo?.country ?? 'Unknown',
      coordinates: geo ? { latitude: geo.lat, longitude: geo.lon } : null,
      population: geo?.population ? `${(geo.population / 1_000_000).toFixed(1)}M` : 'Unknown',
      description: summary,
      mapLink: geo ? `https://www.openstreetmap.org/?mlat=${geo.lat}&mlon=${geo.lon}&zoom=12` : null,
      wikiLink: `https://en.wikipedia.org/wiki/${encodeURIComponent(cityStr)}`,
    }
  },
}
