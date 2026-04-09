import type { OrbinexTool } from '../lib/types'

export const datetimeTool: OrbinexTool = {
  name: 'get_datetime',
  description: 'Get the current date, time, day of week, timezone, and other time-related information. Use when asked about the current time, date, day, year, or timezone.',
  parameters: {
    timezone: {
      type: 'string',
      description: 'IANA timezone name e.g. "Asia/Kolkata", "America/New_York", "Europe/London". Defaults to UTC.',
      required: false,
    },
    format: {
      type: 'string',
      description: '"full" for complete details, "date" for date only, "time" for time only. Default: "full"',
      required: false,
    },
  },
  handler: async ({ timezone, format }) => {
    const tz  = String(timezone ?? 'UTC')
    const fmt = String(format   ?? 'full')
    const now = new Date()

    const toTz = (opts: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat('en-US', { ...opts, timeZone: tz }).format(now)

    const date     = toTz({ year: 'numeric', month: 'long',  day: 'numeric' })
    const time     = toTz({ hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    const dayName  = toTz({ weekday: 'long' })
    const iso      = now.toISOString()
    const tzOffset = toTz({ timeZoneName: 'short' }).split(' ').pop()

    if (fmt === 'date') return { date, dayName, timezone: tz }
    if (fmt === 'time') return { time, timezone: tz, offset: tzOffset }

    return {
      date, time, dayName,
      timezone:   tz,
      offset:     tzOffset,
      iso,
      unix:       Math.floor(now.getTime() / 1000),
      year:       parseInt(toTz({ year: 'numeric' })),
      month:      toTz({ month: 'long' }),
      weekNumber: Math.ceil((Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000) + 1) / 7),
    }
  },
}