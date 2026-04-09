import type { OrbinexTool } from '../lib/types'
import config from '../config'

// Geocode city name → lat/lon using open-meteo geocoding (free, no key)
async function geocode(city: string): Promise<{ lat: number; lon: number; name: string }> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Geocoding failed for "${city}"`)
  const data = await res.json() as any
  if (!data.results?.length) throw new Error(`City not found: "${city}"`)
  const r = data.results[0]
  return { lat: r.latitude, lon: r.longitude, name: r.name }
}

// Free weather via open-meteo (no API key needed)
async function getWeatherFree(city: string, units: 'metric' | 'imperial') {
  const { lat, lon, name } = await geocode(city)
  const tempUnit = units === 'metric' ? 'celsius' : 'fahrenheit'
  const windUnit = units === 'metric' ? 'kmh' : 'mph'
  const url = [
    'https://api.open-meteo.com/v1/forecast',
    `?latitude=${lat}&longitude=${lon}`,
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`,
    `&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}`,
  ].join('')
  const res = await fetch(url)
  if (!res.ok) throw new Error('open-meteo request failed')
  const d = await res.json() as any
  const c = d.current
  const symbol = units === 'metric' ? '°C' : '°F'
  const windSymbol = units === 'metric' ? 'km/h' : 'mph'
  return {
    city: name,
    temperature: `${c.temperature_2m}${symbol}`,
    humidity: `${c.relative_humidity_2m}%`,
    windSpeed: `${c.wind_speed_10m} ${windSymbol}`,
    condition: weatherCodeToText(c.weather_code),
    source: 'open-meteo (free)',
  }
}

// Paid weather via OpenWeatherMap (more detail, needs free API key)
async function getWeatherOWM(city: string, apiKey: string, units: 'metric' | 'imperial') {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${units}`
  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json() as any
    throw new Error(err.message ?? 'OpenWeatherMap request failed')
  }
  const d = await res.json() as any
  const symbol = units === 'metric' ? '°C' : '°F'
  const windSymbol = units === 'metric' ? 'km/h' : 'mph'
  return {
    city:        d.name,
    country:     d.sys.country,
    temperature: `${Math.round(d.main.temp)}${symbol}`,
    feelsLike:   `${Math.round(d.main.feels_like)}${symbol}`,
    humidity:    `${d.main.humidity}%`,
    windSpeed:   `${Math.round((d.wind.speed ?? 0) * (units === 'metric' ? 3.6 : 1))} ${windSymbol}`,
    condition:   d.weather[0].description,
    icon:        `https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png`,
    source: 'OpenWeatherMap',
  }
}

function weatherCodeToText(code: number): string {
  if (code === 0)            return 'Clear sky'
  if (code <= 3)             return 'Partly cloudy'
  if (code <= 9)             return 'Foggy'
  if (code <= 19)            return 'Drizzle'
  if (code <= 29)            return 'Rain'
  if (code <= 39)            return 'Snow'
  if (code <= 49)            return 'Freezing rain'
  if (code <= 59)            return 'Drizzle'
  if (code <= 69)            return 'Rain'
  if (code <= 79)            return 'Snow'
  if (code <= 84)            return 'Rain showers'
  if (code <= 94)            return 'Thunderstorm'
  return 'Severe thunderstorm'
}

export const weatherTool: OrbinexTool = {
  name: 'get_weather',
  description: 'Get current weather conditions for any city in the world. Returns temperature, humidity, wind speed, and conditions.',
  parameters: {
    city: {
      type: 'string',
      description: 'City name, e.g. "Mumbai", "New York", "London"',
      required: true,
    },
    units: {
      type: 'string',
      description: 'Temperature units: "metric" (Celsius) or "imperial" (Fahrenheit). Defaults to config setting.',
      required: false,
    },
  },
  handler: async ({ city, units }) => {
    const cityStr  = String(city)
    const unitVal  = (units === 'imperial' ? 'imperial' : config.weather.units) as 'metric' | 'imperial'
    if (config.weather.apiKey) {
      return getWeatherOWM(cityStr, config.weather.apiKey, unitVal)
    }
    return getWeatherFree(cityStr, unitVal)
  },
}
