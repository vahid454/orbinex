import type { OrbinexTool } from '../lib/types'

// ─────────────────────────────────────────────────────────────────
//  Example tools — replace or extend these with your own.
//  Each tool needs: name, description, parameters schema, handler.
// ─────────────────────────────────────────────────────────────────

export const exampleTools: OrbinexTool[] = [
  {
    name: 'get_weather',
    description: 'Get the current weather for a given city.',
    parameters: {
      city: {
        type: 'string',
        description: 'City name, e.g. "Mumbai"',
        required: true,
      },
    },
    handler: async ({ city }) => {
      // Replace with a real weather API call
      return {
        city,
        temperature: '28°C',
        condition: 'Partly cloudy',
        humidity: '72%',
      }
    },
  },

  {
    name: 'search_products',
    description: 'Search the product catalog by keyword.',
    parameters: {
      query: {
        type: 'string',
        description: 'Search keyword',
        required: true,
      },
      limit: {
        type: 'number',
        description: 'Max results (default 5)',
        required: false,
      },
    },
    handler: async ({ query, limit = 5 }) => {
      // Replace with real DB / Elasticsearch call
      return {
        query,
        results: [
          { id: '1', name: `${query} Pro`, price: '$99' },
          { id: '2', name: `${query} Lite`, price: '$49' },
        ].slice(0, Number(limit)),
      }
    },
  },
]
