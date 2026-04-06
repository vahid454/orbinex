import type { OrbinexTool } from '../lib/types'

type UnitMap = Record<string, number>

const LENGTH: UnitMap = {
  mm: 0.001, cm: 0.01, m: 1, km: 1000,
  inch: 0.0254, ft: 0.3048, yd: 0.9144, mile: 1609.344, nautical_mile: 1852,
}
const WEIGHT: UnitMap = {
  mg: 0.000001, g: 0.001, kg: 1, tonne: 1000,
  oz: 0.0283495, lb: 0.453592, stone: 6.35029,
}
const VOLUME: UnitMap = {
  ml: 0.001, l: 1, m3: 1000,
  tsp: 0.00492892, tbsp: 0.0147868, cup: 0.236588, pint: 0.473176, quart: 0.946353, gallon: 3.78541,
  fl_oz: 0.0295735,
}
const TEMP_FUNCS: Record<string, Record<string, (v: number) => number>> = {
  celsius:    { fahrenheit: v => v * 9/5 + 32,    kelvin: v => v + 273.15,   celsius: v => v },
  fahrenheit: { celsius: v => (v - 32) * 5/9,      kelvin: v => (v + 459.67) * 5/9, fahrenheit: v => v },
  kelvin:     { celsius: v => v - 273.15,           fahrenheit: v => v * 9/5 - 459.67, kelvin: v => v },
}
const AREA: UnitMap = {
  mm2: 0.000001, cm2: 0.0001, m2: 1, km2: 1e6,
  inch2: 0.00064516, ft2: 0.092903, acre: 4046.86, hectare: 10000,
}
const SPEED: UnitMap = {
  mps: 1, kph: 0.277778, mph: 0.44704, knot: 0.514444,
}

function convertLinear(value: number, from: string, to: string, map: UnitMap): number | null {
  const f = map[from.toLowerCase()], t = map[to.toLowerCase()]
  if (f === undefined || t === undefined) return null
  return (value * f) / t
}

export const unitConverterTool: OrbinexTool = {
  name: 'convert_units',
  description: 'Convert between units of measurement: length, weight/mass, volume, temperature, area, speed. Use for any unit conversion question.',
  parameters: {
    value:    { type: 'number', description: 'The numeric value to convert', required: true },
    from:     { type: 'string', description: 'Source unit (e.g. "kg", "miles", "celsius", "ft2")', required: true },
    to:       { type: 'string', description: 'Target unit (e.g. "lb", "km", "fahrenheit", "m2")', required: true },
    category: { type: 'string', description: 'Optional: "length", "weight", "volume", "temperature", "area", "speed". Auto-detected if omitted.', required: false },
  },
  handler: async ({ value, from, to, category }) => {
    const v    = Number(value)
    const f    = String(from).toLowerCase().replace(/\s/g, '_')
    const t    = String(to).toLowerCase().replace(/\s/g, '_')

    // Temperature special case
    const tempConvert = TEMP_FUNCS[f]?.[t]
    if (tempConvert) {
      const result = tempConvert(v)
      return { value: v, from: f, to: t, result: +result.toFixed(4), display: `${v} ${f} = ${result.toFixed(2)} ${t}` }
    }

    const maps: Record<string, UnitMap> = { length: LENGTH, weight: WEIGHT, volume: VOLUME, area: AREA, speed: SPEED }
    const cats = category ? [String(category).toLowerCase()] : Object.keys(maps)

    for (const cat of cats) {
      const result = convertLinear(v, f, t, maps[cat] ?? {})
      if (result !== null) {
        return {
          value: v, from: f, to: t,
          result: +result.toFixed(6),
          display: `${v} ${f} = ${+result.toFixed(4)} ${t}`,
          category: cat,
        }
      }
    }

    return {
      error: `Cannot convert "${f}" to "${t}". Supported: length (m, km, ft, mile...), weight (kg, lb, oz...), volume (l, ml, cup, gallon...), temperature (celsius, fahrenheit, kelvin), area (m2, ft2, acre...), speed (mps, kph, mph...).`
    }
  },
}