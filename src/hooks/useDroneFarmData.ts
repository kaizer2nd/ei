import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { seedReading, sourceByTransport } from '../services/dataSource'
import type {
  AppSettings,
  FarmInsight,
  SensorReading,
  SystemStatus,
  TimeFilter,
  TimelineEvent,
  ZoneSnapshot,
} from '../types'
import { buildFarmInsight, buildTimelineEvent, buildZones } from '../utils'

const ONE_HOUR = 60 * 60 * 1000
const ONE_DAY = 24 * ONE_HOUR
const SEVEN_DAYS = 7 * ONE_DAY

function cutoffFromFilter(filter: TimeFilter): number {
  const now = Date.now()
  if (filter === '1h') return now - ONE_HOUR
  if (filter === '24h') return now - ONE_DAY
  return now - SEVEN_DAYS
}

function beep(duration = 180): void {
  const audioContext = new window.AudioContext()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  oscillator.frequency.value = 920
  gainNode.gain.value = 0.06
  oscillator.start()

  window.setTimeout(() => {
    oscillator.stop()
    void audioContext.close()
  }, duration)
}

export function useDroneFarmData(settings: AppSettings) {
  const [current, setCurrent] = useState<SensorReading | null>(seedReading)
  const [history, setHistory] = useState<SensorReading[]>([seedReading])
  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    {
      id: `ev-${seedReading.timestamp}`,
      timestamp: seedReading.timestamp,
      title: 'Seed telemetry loaded',
      description: 'Waiting for live stream from Arduino bridge or mock source.',
      severity: 'Low',
    },
  ])
  const [insight, setInsight] = useState<FarmInsight | null>(() => buildFarmInsight(seedReading, null))
  const [zones, setZones] = useState<ZoneSnapshot[]>(() => buildZones(seedReading))
  const [system, setSystem] = useState<SystemStatus>({
    connected: false,
    lastSync: 0,
    latencyMs: 0,
    transport: settings.transport,
  })

  const previousRef = useRef<SensorReading | null>(null)

  useEffect(() => {
    const source = sourceByTransport(settings.transport)
    const disconnect = source.connect((reading) => {
      const now = Date.now()
      const latency = Math.max(20, now - reading.timestamp + Math.round(Math.random() * 60))
      const previous = previousRef.current

      setCurrent(reading)
      setHistory((existing) => {
        const merged = [...existing, reading]
        return merged.slice(-800)
      })

      const nextInsight = buildFarmInsight(reading, previous)
      setInsight(nextInsight)
      setZones(buildZones(reading))

      const event = buildTimelineEvent(reading, previous)
      if (event) {
        setTimeline((existing) => [event, ...existing].slice(0, 24))
      }

      if (settings.alertsEnabled && nextInsight.condition === 'Critical') {
        toast.error('Critical farm condition detected', {
          description: 'Immediate intervention is recommended for one or more zones.',
        })
        if (settings.soundEnabled) {
          beep()
        }
      }

      previousRef.current = reading
      setSystem({
        connected: true,
        lastSync: now,
        latencyMs: latency,
        transport: source.transport,
      })
    })

    return () => {
      disconnect()
      setSystem((existing) => ({ ...existing, connected: false }))
    }
  }, [settings.alertsEnabled, settings.soundEnabled, settings.transport])

  const byFilter = useMemo(() => {
    return (filter: TimeFilter): SensorReading[] => {
      const cutoff = cutoffFromFilter(filter)
      return history.filter((item) => item.timestamp >= cutoff)
    }
  }, [history])

  return {
    current,
    history,
    timeline,
    insight,
    zones,
    system,
    byFilter,
  }
}
