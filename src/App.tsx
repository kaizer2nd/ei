import { useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'
import { motion } from 'framer-motion'
import { Download, SunMedium, Droplets, ThermometerSun, CloudRain } from 'lucide-react'
import { Toaster, toast } from 'sonner'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { SensorCard } from './components/SensorCard'
import { FarmScore } from './components/FarmScore'
import { RecommendationPanel } from './components/RecommendationPanel'
import { PredictionPanel } from './components/PredictionPanel'
import { TimelinePanel } from './components/TimelinePanel'
import { HistoricalCharts } from './components/HistoricalCharts'
import { ZoneView } from './components/ZoneView'
import { SystemStatusPanel } from './components/SystemStatusPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { LoadingScreen } from './components/LoadingScreen'
import { t, conditionLabel } from './i18n'
import { useDroneFarmData } from './hooks/useDroneFarmData'
import type { AppSettings, NavView, TimeFilter } from './types'
import { formatTime } from './utils'

function App() {
  const [isBooting, setIsBooting] = useState(true)
  const [activeView, setActiveView] = useState<NavView>('dashboard')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('24h')
  const [settings, setSettings] = useState<AppSettings>({
    language: 'en',
    alertsEnabled: true,
    soundEnabled: true,
    transport: 'serial-bridge',
  })

  const labels = t(settings.language)
  const { current, timeline, insight, zones, system, byFilter, history } = useDroneFarmData(settings)

  useEffect(() => {
    const timer = window.setTimeout(() => setIsBooting(false), 1400)
    return () => window.clearTimeout(timer)
  }, [])

  const filteredHistory = byFilter(timeFilter)

  const sensorCards = useMemo(() => {
    if (!current) return []
    return [
      {
        key: 'temp',
        label: 'Temperature',
        value: `${current.temp.toFixed(1)}°C`,
        status: current.temp > 34 || current.temp < 12 ? 'alert' : 'good',
        icon: <ThermometerSun className="h-4 w-4" strokeWidth={1.5} />,
      },
      {
        key: 'humidity',
        label: 'Humidity',
        value: `${current.humidity.toFixed(1)}%`,
        status: current.humidity > 78 || current.humidity < 35 ? 'alert' : 'good',
        icon: <Droplets className="h-4 w-4" strokeWidth={1.5} />,
      },
      {
        key: 'light',
        label: 'Light Intensity',
        value: `${current.light}`,
        status: current.light < 280 || current.light > 900 ? 'alert' : 'good',
        icon: <SunMedium className="h-4 w-4" strokeWidth={1.5} />,
      },
      {
        key: 'rain',
        label: 'Rain Status',
        value: current.rain ? 'Rain Detected' : 'No Rain',
        status: current.rain ? 'alert' : 'good',
        icon: <CloudRain className="h-4 w-4" strokeWidth={1.5} />,
      },
    ] as const
  }, [current])

  if (isBooting) {
    return <LoadingScreen />
  }

  const exportCsv = () => {
    if (history.length === 0) return
    const csv = Papa.unparse(history)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dronefarm-ai-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('CSV export generated')
  }

  return (
    <div className="min-h-screen text-slate-100">
      <Toaster position="top-right" richColors />

      <div className="mx-auto flex min-h-screen max-w-[1640px] flex-col md:flex-row">
        <div className="hidden md:block">
          <Sidebar current={activeView} onChange={setActiveView} labels={labels.nav} />
        </div>

        <main className="min-h-screen flex-1 px-4 py-4 md:px-6 md:py-6 lg:px-8">
          <TopBar
            title={labels.productName}
            subtitle={labels.subtitle}
            status={system}
            connectedText={labels.connected}
            disconnectedText={labels.disconnected}
            lastSyncText={labels.lastSync}
            latencyText={labels.latency}
          />

          <div className="mb-5 flex flex-wrap gap-2 md:hidden">
            {(Object.keys(labels.nav) as NavView[]).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setActiveView(view)}
                className={`rounded-full px-3.5 py-2 text-xs font-medium transition-all duration-300 ${
                  activeView === view
                    ? 'bg-white/12 text-white shadow-[0_10px_24px_-18px_rgba(0,0,0,0.8)]'
                    : 'bg-white/5 text-slate-300 hover:bg-white/8 hover:text-white'
                }`}
              >
                {labels.nav[view]}
              </button>
            ))}
          </div>

          <motion.section
            key={activeView}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-5"
          >
            {activeView === 'dashboard' && (
              <>
                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                  {sensorCards.map((sensor) => (
                    <SensorCard
                      key={sensor.key}
                      label={sensor.label}
                      value={sensor.value}
                      status={sensor.status}
                      icon={sensor.icon}
                      updatedAt={current ? formatTime(current.timestamp) : '-'}
                    />
                  ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-12">
                  <div className="xl:col-span-4">
                    {insight ? (
                      <FarmScore
                        score={insight.score}
                        condition={insight.condition}
                        title={labels.farmIntelligenceScore}
                        conditionLabelText={labels.farmCondition}
                        conditionText={conditionLabel(settings.language, insight.condition)}
                      />
                    ) : null}
                  </div>
                  <div className="xl:col-span-4">
                    <SystemStatusPanel
                      title={labels.systemStatus}
                      connectedText={labels.connected}
                      disconnectedText={labels.disconnected}
                      lastSyncText={labels.lastSync}
                      latencyText={labels.latency}
                      transportText={labels.dataTransport}
                      status={system}
                    />
                  </div>
                  <div className="xl:col-span-4">
                    <ZoneView title={labels.zoneView} zones={zones} />
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <RecommendationPanel
                    title={labels.smartRecommendations}
                    priorityText={labels.priority}
                    items={insight?.recommendations ?? []}
                  />
                  <PredictionPanel title={labels.predictions} confidenceText={labels.confidence} items={insight?.predictions ?? []} />
                </div>

                <TimelinePanel title={labels.timeline} events={timeline} />
              </>
            )}

            {activeView === 'analytics' && (
              <>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={exportCsv}
                    className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/50 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-100 hover:bg-cyan-500/20"
                  >
                    <Download className="h-4 w-4" />
                    {labels.exportCsv}
                  </button>
                </div>
                <HistoricalCharts
                  title={labels.historicalGraphs}
                  readings={filteredHistory}
                  activeFilter={timeFilter}
                  onFilterChange={setTimeFilter}
                />
                <TimelinePanel title={labels.analyticsCenter} events={timeline} />
              </>
            )}

            {activeView === 'intelligence' && (
              <div className="grid gap-4 xl:grid-cols-2">
                <RecommendationPanel
                  title={labels.smartRecommendations}
                  priorityText={labels.priority}
                  items={insight?.recommendations ?? []}
                />
                <PredictionPanel title={labels.predictions} confidenceText={labels.confidence} items={insight?.predictions ?? []} />
                <div className="xl:col-span-2">
                  <TimelinePanel title={labels.intelligenceHub} events={timeline} />
                </div>
              </div>
            )}

            {activeView === 'settings' && (
              <SettingsPanel
                title={labels.settingsTitle}
                languageLabel={labels.language}
                alertsLabel={labels.alerts}
                soundLabel={labels.criticalSound}
                backendLabel={labels.backend}
                transportLabel={labels.dataTransport}
                serialBridgeLabel={labels.serialBridge}
                value={settings}
                onChange={setSettings}
              />
            )}
          </motion.section>
        </main>
      </div>
    </div>
  )
}

export default App
