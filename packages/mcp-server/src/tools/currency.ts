import type { OrbinexTool } from '../lib/types'

// Open Exchange Rates (free tier) — OR fallback to exchangerate.host (free, no key)
async function getRate(from: string, to: string): Promise<number | null> {
  // Try exchangerate-api open endpoint (free, no key)
  const url = `https://open.er-api.com/v6/latest/${from.toUpperCase()}`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json() as any
  return data.rates?.[to.toUpperCase()] ?? null
}

export const currencyTool: OrbinexTool = {
  name: 'get_currency_rate',
  description: 'Get live currency exchange rates between any two currencies. Also supports converting a specific amount.',
  parameters: {
    from: {
      type: 'string',
      description: 'Source currency code, e.g. "USD", "EUR", "INR"',
      required: true,
    },
    to: {
      type: 'string',
      description: 'Target currency code, e.g. "INR", "GBP", "JPY"',
      required: true,
    },
    amount: {
      type: 'number',
      description: 'Amount to convert (default: 1)',
      required: false,
    },
  },
  handler: async ({ from, to, amount }) => {
    const fromStr = String(from).toUpperCase()
    const toStr   = String(to).toUpperCase()
    const amt     = Number(amount ?? 1)

    const rate = await getRate(fromStr, toStr)
    if (rate === null) {
      return { error: `Could not fetch rate for ${fromStr} → ${toStr}` }
    }

    const converted = (amt * rate).toFixed(2)

    return {
      from:         fromStr,
      to:           toStr,
      rate:         rate.toFixed(4),
      amount:       amt,
      converted:    Number(converted),
      display:      `${amt} ${fromStr} = ${converted} ${toStr}`,
      updatedAt:    new Date().toUTCString(),
      source:       'open.er-api.com (free)',
    }
  },
}
