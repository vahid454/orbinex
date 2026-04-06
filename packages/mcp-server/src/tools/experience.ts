import type { OrbinexTool } from '../lib/types'
import config from '../config'

// ─── Experience data shaper ────────────────────────────────────
// Transforms raw API response into a clean, readable format
// Customize the shape() function to match your actual API response
function shape(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') return { raw }
  const data = raw as Record<string, unknown>

  // If it's already an array, wrap it
  if (Array.isArray(raw)) {
    return {
      totalExperiences: raw.length,
      experiences: raw.map((item: any, i: number) => shapeItem(item, i)),
    }
  }

  // If it has an items/data/results array inside
  const list = (data.items ?? data.data ?? data.results ?? data.experience ?? null) as any[]
  if (Array.isArray(list)) {
    return {
      totalExperiences: list.length,
      experiences: list.map((item: any, i: number) => shapeItem(item, i)),
    }
  }

  // Single experience object — shape it directly
  return { experience: shapeItem(data, 0) }
}

function shapeItem(item: Record<string, unknown>, index: number) {
  // Adapt field names to match YOUR API response structure
  return {
    index:       index + 1,
    title:       item.title       ?? item.jobTitle    ?? item.position   ?? item.role      ?? 'N/A',
    company:     item.company     ?? item.employer    ?? item.org        ?? item.organization ?? 'N/A',
    location:    item.location    ?? item.place       ?? item.city       ?? 'N/A',
    startDate:   item.startDate   ?? item.start       ?? item.from       ?? item.startYear  ?? 'N/A',
    endDate:     item.endDate     ?? item.end         ?? item.to         ?? item.endYear    ?? 'Present',
    description: item.description ?? item.summary     ?? item.details    ?? item.bio        ?? '',
    skills:      item.skills      ?? item.technologies ?? item.stack     ?? [],
    type:        item.type        ?? item.employmentType ?? 'Full-time',
  }
}

export const experienceTool: OrbinexTool = {
  name: 'get_experience',
  description: 'Fetch professional experience, work history, and career details from the profile API. Use this when someone asks about experience, work history, jobs, career, skills, or background.',
  parameters: {
    filter: {
      type: 'string',
      description: 'Optional filter: "recent" for latest role, "all" for full history, or a company/skill name to search',
      required: false,
    },
  },
  handler: async ({ filter }) => {
    const baseUrl = config.experienceApi.url
    if (!baseUrl) {
      return { error: 'Experience API URL not configured. Set EXPERIENCE_API_URL in mcp-server .env' }
    }

    let url = baseUrl
    if (filter) {
      // Append filter as query param if supported by your API
      url = `${baseUrl}?filter=${encodeURIComponent(String(filter))}`
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept':       'application/json',
    }
    if (config.experienceApi.apiKey) {
      headers['Authorization'] = `Bearer ${config.experienceApi.apiKey}`
    }

    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(8000) })
      if (!res.ok) {
        return { error: `Experience API returned ${res.status}: ${res.statusText}`, url }
      }
      const raw = await res.json()
      const data = shape(raw)

      // Apply client-side filter for "recent"
      if (filter === 'recent' && Array.isArray(data.experiences)) {
        return { ...data, experiences: (data.experiences as any[]).slice(0, 1) }
      }

      return data
    } catch (err: any) {
      if (err.name === 'TimeoutError') {
        return { error: 'Experience API timed out after 8 seconds', url }
      }
      return { error: err.message, url }
    }
  },
}
