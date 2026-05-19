import { Clock3, Activity } from 'lucide-react'
import type { SystemStatus } from '../types'
import { formatTime } from '../utils'

type TopBarProps = {
  title: string
  subtitle: string
  status: SystemStatus
  connectedText: string
  disconnectedText: string
  lastSyncText: string
  latencyText: string
}

export function TopBar({
  title,
  subtitle,
  status,
  connectedText,
  disconnectedText,
  lastSyncText,
  latencyText,
}: TopBarProps) {
  return (
    <header className="mb-6 rounded-[24px] bg-white/5 px-4 py-3.5 shadow-[0_16px_48px_-34px_rgba(0,0,0,0.95)] backdrop-blur-2xl md:px-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-slate-50 md:text-[30px]">{title}</h1>
          <p className="mt-1 text-sm leading-6 text-slate-400">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2">
            <span className={status.connected ? 'h-2.5 w-2.5 rounded-full bg-emerald-400' : 'h-2.5 w-2.5 rounded-full bg-rose-400'} />
            <span>{status.connected ? connectedText : disconnectedText}</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-slate-400">
            <Clock3 className="h-4 w-4 text-slate-500" />
            <span>
              {lastSyncText} {formatTime(status.lastSync)}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-slate-400">
            <Activity className="h-4 w-4 text-slate-500" />
            <span>
              {latencyText} {status.latencyMs} ms
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
