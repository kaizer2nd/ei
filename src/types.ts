export type NavView = 'dashboard' | 'analytics' | 'intelligence' | 'settings'

export type TimeFilter = '1h' | '24h' | '7d'
export type Priority = 'High' | 'Medium' | 'Low'
export type Confidence = 'High' | 'Medium' | 'Low'
export type FarmCondition = 'Optimal' | 'Moderate' | 'Critical'
export type ZoneStatus = 'Dry' | 'Wet' | 'Optimal'
export type DataTransport = 'mock' | 'firebase' | 'mqtt' | 'serial-bridge'

export interface SensorReading {
  temp: number
  humidity: number
  light: number
  rain: boolean
  timestamp: number
}

export interface Recommendation {
  id: string
  text: string
  priority: Priority
}

export interface Prediction {
  id: string
  text: string
  confidence: Confidence
}

export interface TimelineEvent {
  id: string
  timestamp: number
  title: string
  description: string
  severity: Priority
}

export interface ZoneSnapshot {
  zone: 'Zone A' | 'Zone B' | 'Zone C'
  status: ZoneStatus
}

export interface SystemStatus {
  connected: boolean
  lastSync: number
  latencyMs: number
  transport: DataTransport
}

export interface FarmInsight {
  score: number
  condition: FarmCondition
  recommendations: Recommendation[]
  predictions: Prediction[]
}

export interface AppSettings {
  language: 'en' | 'hi'
  alertsEnabled: boolean
  soundEnabled: boolean
  transport: DataTransport
}
