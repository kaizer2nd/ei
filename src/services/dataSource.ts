import type { DataTransport, SensorReading } from '../types'

type Listener = (reading: SensorReading) => void

export interface SensorDataSource {
  transport: DataTransport
  connect: (listener: Listener) => () => void
}

const SERIAL_BRIDGE_URL = 'ws://127.0.0.1:8787'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function nextMockReading(previous: SensorReading): SensorReading {
  const drift = (amplitude: number) => (Math.random() - 0.5) * amplitude

  const temp = clamp(previous.temp + drift(2.8), 8, 44)
  const humidity = clamp(previous.humidity + drift(7), 20, 95)
  const light = Math.round(clamp(previous.light + drift(180), 80, 980))
  const rainChance = humidity > 78 ? 0.42 : humidity > 65 ? 0.22 : 0.08

  return {
    temp: Number(temp.toFixed(1)),
    humidity: Number(humidity.toFixed(1)),
    light,
    rain: Math.random() < rainChance,
    timestamp: Date.now(),
  }
}

function parseBoolean(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined
  const normalized = value.trim().toLowerCase()
  if (['rain', 'wet', 'detected', 'true', 'yes'].includes(normalized)) return true
  if (['dry', 'clear', 'not detected', 'false', 'no'].includes(normalized)) return false
  if (normalized === '1') return false
  if (normalized === '0') return true
  return undefined
}

function parseRainValue(value: unknown): boolean {
  if (value === undefined || value === null) return false
  if (typeof value === 'boolean') return value

  if (typeof value === 'number') {
    if (value === 1) return false
    if (value === 0) return true
    return value > 0
  }

  const normalized = String(value).trim().toLowerCase()
  if (['rain', 'wet', 'detected', 'true', 'yes'].includes(normalized)) return true
  if (['dry', 'clear', 'not detected', 'false', 'no'].includes(normalized)) return false
  if (normalized === '1') return false
  if (normalized === '0') return true
  return false
}

function parseLineToReading(line: string): SensorReading | null {
  const trimmed = line.trim()
  if (!trimmed) return null

  try {
    const parsed = JSON.parse(trimmed) as Partial<SensorReading>
    if (
      typeof parsed.temp === 'number' &&
      typeof parsed.humidity === 'number' &&
      typeof parsed.light === 'number'
    ) {
      return {
        temp: parsed.temp,
        humidity: parsed.humidity,
        light: parsed.light,
        rain: parseRainValue(parsed.rain),
        timestamp: typeof parsed.timestamp === 'number' ? parsed.timestamp : Date.now(),
      }
    }
  } catch {
    // Fall through to key-value parsing.
  }

  const matches = Object.fromEntries(
    trimmed
      .split(/[;,|]/)
      .map((pair) => pair.trim())
      .filter(Boolean)
      .map((pair) => {
        const [rawKey, ...rest] = pair.split(/[:=]/)
        return [rawKey?.trim().toLowerCase(), rest.join(':').trim()]
      })
      .filter(([key, value]) => Boolean(key) && Boolean(value)),
  ) as Record<string, string>

  const temp = Number.parseFloat(matches.temp ?? matches.temperature)
  const humidity = Number.parseFloat(matches.humidity ?? matches.hum)
  const light = Number.parseFloat(matches.light ?? matches.lux ?? matches.intensity)
  const rain = parseBoolean(matches.rain ?? matches.rain_status ?? matches.water)

  if ([temp, humidity, light].some((value) => Number.isNaN(value))) return null

  return {
    temp,
    humidity,
    light: Math.round(light),
    rain: rain ?? false,
    timestamp: Date.now(),
  }
}

export const seedReading: SensorReading = {
  temp: 25.1,
  humidity: 59.4,
  light: 620,
  rain: false,
  timestamp: Date.now(),
}

export function createMockSource(intervalMs = 4500): SensorDataSource {
  return {
    transport: 'mock',
    connect(listener) {
      let current = seedReading
      listener(current)

      const timer = window.setInterval(() => {
        current = nextMockReading(current)
        listener(current)
      }, intervalMs)

      return () => window.clearInterval(timer)
    },
  }
}

export function createFutureFirebaseSource(): SensorDataSource {
  return {
    transport: 'firebase',
    connect(listener) {
      const mock = createMockSource().connect(listener)
      return () => mock()
    },
  }
}

export function createFutureMqttSource(): SensorDataSource {
  return {
    transport: 'mqtt',
    connect(listener) {
      const mock = createMockSource().connect(listener)
      return () => mock()
    },
  }
}

export function createSerialBridgeSource(): SensorDataSource {
  return {
    transport: 'serial-bridge',
    connect(listener) {
      if (typeof window === 'undefined' || typeof window.WebSocket === 'undefined') {
        return createMockSource().connect(listener)
      }

      let connected = false
      const socket = new window.WebSocket(SERIAL_BRIDGE_URL)

      socket.addEventListener('open', () => {
        connected = true
      })

      socket.addEventListener('message', (event) => {
        const payload = typeof event.data === 'string' ? event.data : ''
        const reading = parseLineToReading(payload)
        if (reading) {
          listener(reading)
        }
      })

      socket.addEventListener('close', () => {
        connected = false
      })

      socket.addEventListener('error', () => {
        if (!connected) {
          console.warn(`Serial bridge unavailable at ${SERIAL_BRIDGE_URL}`)
        }
      })

      return () => {
        socket.close()
      }
    },
  }
}

export function sourceByTransport(transport: DataTransport): SensorDataSource {
  if (transport === 'firebase') return createFutureFirebaseSource()
  if (transport === 'mqtt') return createFutureMqttSource()
  if (transport === 'serial-bridge') return createSerialBridgeSource()
  return createMockSource()
}
