import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts'
import { Card } from './Card'
import type { SensorReading, TimeFilter } from '../types'
import { formatTime } from '../utils'

const filters: TimeFilter[] = ['1h', '24h', '7d']

type HistoricalChartsProps = {
  title: string
  readings: SensorReading[]
  activeFilter: TimeFilter
  onFilterChange: (value: TimeFilter) => void
}

export function HistoricalCharts({ title, readings, activeFilter, onFilterChange }: HistoricalChartsProps) {
  const chartData = readings.map((item) => ({
    time: formatTime(item.timestamp),
    temp: item.temp,
    humidity: item.humidity,
    light: item.light,
  }))

  const chartValues = chartData.flatMap((item) => [item.temp, item.humidity, item.light])
  const chartMin = chartValues.length > 0 ? Math.min(...chartValues) : 0
  const chartMax = chartValues.length > 0 ? Math.max(...chartValues) : 100
  const chartPadding = Math.max(10, Math.round((chartMax - chartMin) * 0.2))

  return (
    <Card title={title}>
      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => onFilterChange(filter)}
            className={`rounded-full px-3.5 py-2 text-xs font-medium transition-all duration-300 ${
              activeFilter === filter
                ? 'bg-white/12 text-white shadow-[0_10px_24px_-18px_rgba(0,0,0,0.85)]'
                : 'bg-white/4 text-slate-300 hover:bg-white/8 hover:text-white'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 6, left: -8, bottom: 6 }}>
            <CartesianGrid stroke="rgba(148,163,184,0.09)" vertical={false} />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} minTickGap={26} axisLine={false} tickLine={false} />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={28}
              domain={[Math.max(0, chartMin - chartPadding), chartMax + chartPadding]}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(17, 24, 39, 0.92)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 16,
                color: '#e5e7eb',
                boxShadow: '0 18px 40px -24px rgba(0,0,0,0.85)',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: 8, color: '#94a3b8' }} />
            <Line type="monotone" dataKey="temp" name="Temperature" stroke="#7aaef5" strokeWidth={2} dot={false} strokeLinecap="round" />
            <Line type="monotone" dataKey="humidity" name="Humidity" stroke="#8ad3ff" strokeWidth={2} dot={false} strokeLinecap="round" />
            <Line type="monotone" dataKey="light" name="Light" stroke="#c4d0dd" strokeWidth={2} dot={false} strokeLinecap="round" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
