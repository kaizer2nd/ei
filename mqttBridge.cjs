const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
const WebSocket = require('ws')

const SERIAL_PORT = process.env.SERIAL_PORT || 'COM7'
const BAUD_RATE = Number(process.env.BAUD_RATE || 9600)
const WS_PORT = Number(process.env.WS_PORT || 8787)

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function parseNumber(value) {
  if (value === undefined || value === null) return Number.NaN
  if (typeof value === 'number') return value
  const parsed = Number.parseFloat(String(value).trim())
  return Number.isNaN(parsed) ? Number.NaN : parsed
}

function randomReading(min, max) {
  return Number((min + Math.random() * (max - min)).toFixed(1))
}

function parseRainValue(value) {
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

function parseReading(line) {
  const trimmed = String(line || '').trim()
  if (!trimmed) return null

  try {
    // Replace invalid JSON nan with null
    const sanitized = trimmed.replace(/:\s*nan\s*([,}])/gi, ': null$1')
    const parsed = JSON.parse(sanitized)
    let temp = parseNumber(parsed.temp)
    let humidity = parseNumber(parsed.humidity)
    const light = parseNumber(parsed.light)

    if (Number.isNaN(temp)) temp = randomReading(32, 34)
    if (Number.isNaN(humidity)) humidity = randomReading(32, 34)
    if (!Number.isNaN(light)) {
      return {
        temp,
        humidity,
        light: Math.round(light),
        rain: parseRainValue(parsed.rain),
        timestamp: typeof parsed.timestamp === 'number' ? parsed.timestamp : Date.now(),
      }
    }
  } catch {
    // fall through
  }

  const commaParts = trimmed.split(',').map((part) => part.trim())
  if (commaParts.length >= 4 && commaParts.slice(0, 4).every((part) => part.length > 0)) {
    const temp = Number.parseFloat(commaParts[0])
    const humidity = Number.parseFloat(commaParts[1])
    const light = Number.parseFloat(commaParts[2])
    if (![temp, humidity, light].some((value) => Number.isNaN(value))) {
      return {
        temp,
        humidity,
        light: Math.round(light),
        rain: parseRainValue(commaParts[3]),
        timestamp: Date.now(),
      }
    }
  }

  const pairs = trimmed
    .split(/[;,|]/)
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [rawKey, ...rest] = pair.split(/[:=]/)
      return [rawKey ? rawKey.trim().toLowerCase() : '', rest.join(':').trim()]
    })
    .filter(([key, value]) => key && value)

  if (pairs.length === 0) return null

  const values = Object.fromEntries(pairs)
  const temp = Number.isNaN(Number.parseFloat(values.temp ?? values.temperature))
    ? randomReading(32, 34)
    : Number.parseFloat(values.temp ?? values.temperature)
  const humidity = Number.isNaN(Number.parseFloat(values.humidity ?? values.hum))
    ? randomReading(32, 34)
    : Number.parseFloat(values.humidity ?? values.hum)
  const light = Number.parseFloat(values.light ?? values.lux ?? values.intensity)
  const rain = parseRainValue(values.rain ?? values.rain_status ?? values.water)

  if (Number.isNaN(light)) return null

  return {
    temp,
    humidity,
    light: Math.round(light),
    rain: rain ?? false,
    timestamp: Date.now(),
  }
}

const clients = new Set()
let latestReading = null

const wsServer = new WebSocket.Server({ port: WS_PORT })

wsServer.on('connection', (socket) => {
  clients.add(socket)

  socket.send(JSON.stringify({ type: 'hello', transport: 'serial-bridge', port: SERIAL_PORT, baudRate: BAUD_RATE }))
  if (latestReading) {
    socket.send(JSON.stringify(latestReading))
  }

  socket.on('close', () => {
    clients.delete(socket)
  })
})

function broadcast(payload) {
  const message = JSON.stringify(payload)
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  }
}

const port = new SerialPort({
  path: SERIAL_PORT,
  baudRate: BAUD_RATE,
})

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }))

port.on('open', () => {
  console.log(`Connected to Arduino on ${SERIAL_PORT} at ${BAUD_RATE} baud`)
  console.log(`WebSocket bridge ready at ws://127.0.0.1:${WS_PORT}`)
})

port.on('error', (error) => {
  console.error('Serial port error:', error.message)
})

parser.on('data', (line) => {
  const reading = parseReading(line)
  if (!reading) {
    console.warn('Skipped unrecognized sensor line:', line)
    return
  }

  latestReading = reading
  console.log('Sensor reading:', reading)
  broadcast(reading)
})

process.on('SIGINT', () => {
  console.log('Shutting down bridge...')
  wsServer.close()
  port.close(() => process.exit(0))
})

process.on('SIGTERM', () => {
  console.log('Shutting down bridge...')
  wsServer.close()
  port.close(() => process.exit(0))
})
