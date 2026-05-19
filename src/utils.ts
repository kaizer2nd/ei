import type {
  Confidence,
  FarmCondition,
  FarmInsight,
  Prediction,
  Priority,
  Recommendation,
  SensorReading,
  TimelineEvent,
  ZoneSnapshot,
  ZoneStatus,
} from './types'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function bucketCondition(score: number): FarmCondition {
  if (score >= 75) return 'Optimal'
  if (score >= 45) return 'Moderate'
  return 'Critical'
}

function scoreTemperature(temp: number): number {
  const ideal = 24
  const delta = Math.abs(temp - ideal)
  return clamp(100 - delta * 8, 0, 100)
}

function scoreHumidity(humidity: number): number {
  const ideal = 58
  const delta = Math.abs(humidity - ideal)
  return clamp(100 - delta * 3.5, 0, 100)
}

function scoreLight(light: number): number {
  if (light >= 350 && light <= 850) return 100
  if (light < 350) return clamp((light / 350) * 100, 0, 100)
  return clamp(100 - (light - 850) / 3, 0, 100)
}

function priorityWeight(priority: Priority): number {
  if (priority === 'High') return 15
  if (priority === 'Medium') return 8
  return 4
}

export function buildRecommendations(reading: SensorReading): Recommendation[] {
  const recs: Recommendation[] = []

  if (reading.rain) {
    recs.push({ id: 'rain-pause', text: 'Rain detected - pause irrigation schedule immediately.', priority: 'High' })
  }
  if (reading.humidity > 75) {
    recs.push({ id: 'humidity-risk', text: 'High humidity - increased fungal disease risk in canopy.', priority: 'High' })
  } else if (reading.humidity < 35) {
    recs.push({ id: 'humidity-low', text: 'Low humidity - monitor evapotranspiration and water loss.', priority: 'Medium' })
  }
  if (reading.light < 280) {
    recs.push({ id: 'low-light', text: 'Low light detected - delay spraying for better efficacy.', priority: 'Medium' })
  }
  if (reading.temp > 34) {
    recs.push({ id: 'heat-stress', text: 'Temperature spike - activate cooling irrigation cycle.', priority: 'High' })
  } else if (reading.temp < 12) {
    recs.push({ id: 'cold-alert', text: 'Low temperature - consider crop cover in exposed zones.', priority: 'Medium' })
  }

  if (recs.length === 0) {
    recs.push({ id: 'stable', text: 'Conditions are stable. Continue routine drone scan intervals.', priority: 'Low' })
  }

  return recs
}

function confidenceFromTrend(signal: number): Confidence {
  if (signal > 0.72) return 'High'
  if (signal > 0.46) return 'Medium'
  return 'Low'
}

export function buildPredictions(reading: SensorReading, previous: SensorReading | null): Prediction[] {
  const predictions: Prediction[] = []

  const humidityTrend = previous ? reading.humidity - previous.humidity : 0
  const tempTrend = previous ? reading.temp - previous.temp : 0
  const rainLikelihoodSignal = clamp((reading.humidity / 100) * 0.65 + (humidityTrend > 0 ? 0.2 : 0.05) + (reading.temp < 27 ? 0.1 : 0), 0, 1)

  predictions.push({
    id: 'rain-soon',
    text: rainLikelihoodSignal > 0.62 ? 'Rain likely soon based on rising humidity and temperature profile.' : 'No immediate rain signal in current trend.',
    confidence: confidenceFromTrend(rainLikelihoodSignal),
  })

  const heatStressSignal = clamp((reading.temp / 40) * 0.62 + (reading.humidity < 40 ? 0.2 : 0.05) + (tempTrend > 0 ? 0.2 : 0.08), 0, 1)
  predictions.push({
    id: 'heat-stress',
    text: heatStressSignal > 0.6 ? 'Heat stress expected in exposed crop bands.' : 'Heat stress risk remains controlled.',
    confidence: confidenceFromTrend(heatStressSignal),
  })

  return predictions
}

export function buildFarmInsight(reading: SensorReading, previous: SensorReading | null): FarmInsight {
  const recommendations = buildRecommendations(reading)
  const predictions = buildPredictions(reading, previous)

  const sensorComposite = Math.round(
    scoreTemperature(reading.temp) * 0.36 +
      scoreHumidity(reading.humidity) * 0.32 +
      scoreLight(reading.light) * 0.25 +
      (reading.rain ? 55 : 92) * 0.07,
  )

  const penalty = recommendations.reduce((sum, rec) => sum + priorityWeight(rec.priority), 0)
  const score = clamp(sensorComposite - penalty, 0, 100)

  return {
    score,
    condition: bucketCondition(score),
    recommendations,
    predictions,
  }
}

export function buildTimelineEvent(next: SensorReading, previous: SensorReading | null): TimelineEvent | null {
  if (!previous) {
    return {
      id: `ev-${next.timestamp}`,
      timestamp: next.timestamp,
      title: 'Sensor stream initialized',
      description: 'Live monitoring started for farm telemetry.',
      severity: 'Low',
    }
  }

  if (!previous.rain && next.rain) {
    return {
      id: `ev-${next.timestamp}`,
      timestamp: next.timestamp,
      title: 'Rain detected',
      description: 'Rain sensor switched to wet state.',
      severity: 'High',
    }
  }

  if (next.temp - previous.temp >= 3.5) {
    return {
      id: `ev-${next.timestamp}`,
      timestamp: next.timestamp,
      title: 'Temperature spike',
      description: `Temperature increased by ${(next.temp - previous.temp).toFixed(1)}°C.`,
      severity: 'Medium',
    }
  }

  if (previous.light - next.light >= 180) {
    return {
      id: `ev-${next.timestamp}`,
      timestamp: next.timestamp,
      title: 'Light drop',
      description: 'Light intensity dropped sharply; drone shadow or cloud cover likely.',
      severity: 'Medium',
    }
  }

  return {
    id: `ev-${next.timestamp}`,
    timestamp: next.timestamp,
    title: 'Data refresh',
    description: 'Sensor stream heartbeat received.',
    severity: 'Low',
  }
}

function zoneStatusFromSignal(temp: number, humidity: number, rain: boolean): ZoneStatus {
  if (rain || humidity > 75) return 'Wet'
  if (temp > 33 || humidity < 35) return 'Dry'
  return 'Optimal'
}

export function buildZones(reading: SensorReading): ZoneSnapshot[] {
  const perturb = (value: number, offset: number) => value + offset

  return [
    {
      zone: 'Zone A',
      status: zoneStatusFromSignal(perturb(reading.temp, 0.8), perturb(reading.humidity, -3), reading.rain),
    },
    {
      zone: 'Zone B',
      status: zoneStatusFromSignal(perturb(reading.temp, -1.4), perturb(reading.humidity, 4), reading.rain),
    },
    {
      zone: 'Zone C',
      status: zoneStatusFromSignal(perturb(reading.temp, 1.2), perturb(reading.humidity, 1), reading.rain),
    },
  ]
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString([], {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function colorForCondition(condition: FarmCondition): string {
  if (condition === 'Optimal') return 'text-emerald-400'
  if (condition === 'Moderate') return 'text-amber-400'
  return 'text-rose-400'
}

export function classForPriority(priority: Priority): string {
  if (priority === 'High') return 'bg-rose-500/10 text-rose-100'
  if (priority === 'Medium') return 'bg-amber-500/10 text-amber-100'
  return 'bg-sky-500/10 text-sky-100'
}

export function classForConfidence(confidence: Confidence): string {
  if (confidence === 'High') return 'text-emerald-400'
  if (confidence === 'Medium') return 'text-amber-400'
  return 'text-slate-400'
}

export function classForZone(status: ZoneStatus): string {
  if (status === 'Dry') return 'bg-amber-500/10 text-amber-100'
  if (status === 'Wet') return 'bg-sky-500/10 text-sky-100'
  return 'bg-emerald-500/10 text-emerald-100'
}
