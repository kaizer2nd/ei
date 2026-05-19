import { Database } from 'lucide-react'
import { Card } from './Card'
import type { AppSettings, DataTransport } from '../types'

type SettingsPanelProps = {
  title: string
  languageLabel: string
  alertsLabel: string
  soundLabel: string
  backendLabel: string
  transportLabel: string
  serialBridgeLabel: string
  value: AppSettings
  onChange: (next: AppSettings) => void
}

export function SettingsPanel({
  title,
  languageLabel,
  alertsLabel,
  soundLabel,
  backendLabel,
  transportLabel,
  serialBridgeLabel,
  value,
  onChange,
}: SettingsPanelProps) {
  const setTransport = (transport: DataTransport) => onChange({ ...value, transport })

  return (
    <Card title={title} icon={<Database className="h-4 w-4" />}>
      <div className="grid gap-4 text-sm md:grid-cols-2">
        <label className="rounded-2xl bg-white/4 p-4 text-slate-100">
          <span className="text-xs text-slate-400">{languageLabel}</span>
          <select
            className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-[#0A84FF]/50"
            value={value.language}
            onChange={(event) => onChange({ ...value, language: event.target.value as AppSettings['language'] })}
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>
        </label>

        <div className="rounded-2xl bg-white/4 p-4 text-slate-100">
          <p className="text-xs text-slate-400">{transportLabel}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(['mock', 'firebase', 'mqtt', 'serial-bridge'] as const).map((transport) => (
              <button
                key={transport}
                type="button"
                onClick={() => setTransport(transport)}
                className={`rounded-full px-3.5 py-2 text-xs font-medium transition-all duration-300 ${
                  value.transport === transport
                    ? 'bg-white/12 text-white shadow-[0_10px_24px_-18px_rgba(0,0,0,0.8)]'
                    : 'bg-white/4 text-slate-300 hover:bg-white/8 hover:text-white'
                }`}
              >
                {transport === 'serial-bridge' ? serialBridgeLabel : transport}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center justify-between rounded-2xl bg-white/4 p-4 text-slate-100">
          <span>{alertsLabel}</span>
          <input
            type="checkbox"
            checked={value.alertsEnabled}
            onChange={(event) => onChange({ ...value, alertsEnabled: event.target.checked })}
          />
        </label>

        <label className="flex items-center justify-between rounded-2xl bg-white/4 p-4 text-slate-100">
          <span>{soundLabel}</span>
          <input
            type="checkbox"
            checked={value.soundEnabled}
            onChange={(event) => onChange({ ...value, soundEnabled: event.target.checked })}
          />
        </label>
      </div>

      <p className="mt-5 rounded-2xl bg-white/4 p-4 text-sm leading-6 text-slate-300">
        {backendLabel}: The data source adapter can be replaced with real Firebase listeners, MQTT subscriptions, or
        the local serial bridge in src/services/dataSource.ts.
      </p>
    </Card>
  )
}
