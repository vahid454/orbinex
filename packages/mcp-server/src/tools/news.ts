import type { OrbinexTool } from '../lib/types'

// Uses GNews free API — 100 requests/day on free tier
// Sign up at https://gnews.io for a free key
// Falls back to RSS-style approach without a key
async function fetchGNews(query: string, apiKey: string, lang: string, max: number) {
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=${lang}&max=${max}&apikey=${apiKey}`
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`GNews ${res.status}`)
  const data = await res.json() as any
  return (data.articles ?? []).map((a: any) => ({
    title:       a.title,
    description: a.description,
    source:      a.source?.name,
    url:         a.url,
    publishedAt: a.publishedAt,
  }))
}

async function fetchHackerNews(query: string, max: number) {
  // Hacker News Algolia API — always free, no key
  const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=${max}`
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`HN API ${res.status}`)
  const data = await res.json() as any
  return (data.hits ?? []).map((h: any) => ({
    title:       h.title,
    description: `${h.points ?? 0} points · ${h.num_comments ?? 0} comments`,
    source:      'Hacker News',
    url:         h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`,
    publishedAt: h.created_at,
  }))
}

export const newsTool: OrbinexTool = {
  name: 'get_news',
  description: 'Search for recent news articles on any topic. Returns headlines, descriptions, and links. Use when asked about current events, news, or recent developments.',
  parameters: {
    query: {
      type: 'string',
      description: 'Search query, e.g. "AI technology", "India economy", "climate change"',
      required: true,
    },
    source: {
      type: 'string',
      description: '"general" for general news (needs GNEWS_API_KEY), "tech" for Hacker News (always free). Default: "tech"',
      required: false,
    },
    limit: {
      type: 'number',
      description: 'Number of articles to return (1-10). Default: 5',
      required: false,
    },
  },
  handler: async ({ query, source, limit }) => {
    const q      = String(query)
    const src    = String(source ?? 'tech')
    const max    = Math.min(Number(limit ?? 5), 10)
    const apiKey = process.env.GNEWS_API_KEY ?? ''

    if (src === 'general' && apiKey) {
      const articles = await fetchGNews(q, apiKey, 'en', max)
      return { query: q, count: articles.length, source: 'GNews', articles }
    }

    const articles = await fetchHackerNews(q, max)
    return {
      query:  q,
      count:  articles.length,
      source: 'Hacker News',
      note:   apiKey ? undefined : 'Add GNEWS_API_KEY to .env for general news (gnews.io free tier)',
      articles,
    }
  },
}