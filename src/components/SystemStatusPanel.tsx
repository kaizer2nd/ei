import { ServerCog } from 'lucide-react'
import { Card } from './Card'
import type { SystemStatus } from '../types'
import { formatDateTime } from '../utils'

type SystemStatusPanelProps = {
  title: string
  connectedText: string
  disconnectedText: string
  lastSyncText: string
  latencyText: string
  transportText: string
  status: SystemStatus
}

export function SystemStatusPanel({
  title,
  connectedText,
  disconnectedText,
  lastSyncText,
  latencyText,
  transportText,
  status,
}: SystemStatusPanelProps) {
  return (
    <Card title={title} icon={<ServerCog className="h-4 w-4" />}>
      <dl className="space-y-3 text-sm text-slate-300">
        <div className="flex items-center justify-between rounded-2xl bg-white/4 px-4 py-3">
          <dt className="text-slate-400">Status</dt>
          <dd className={status.connected ? 'inline-flex items-center gap-2 text-slate-100' : 'inline-flex items-center gap-2 text-slate-100'}>
            <span className={status.connected ? 'h-2.5 w-2.5 rounded-full bg-emerald-400' : 'h-2.5 w-2.5 rounded-full bg-rose-400'} />
            {status.connected ? connectedText : disconnectedText}
          </dd>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-white/4 px-4 py-3">
          <dt className="text-slate-400">{lastSyncText}</dt>
          <dd className="text-slate-100">{formatDateTime(status.lastSync)}</dd>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-white/4 px-4 py-3">
          <dt className="text-slate-400">{latencyText}</dt>
          <dd className="text-slate-100">{status.latencyMs} ms</dd>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-white/4 px-4 py-3">
          <dt className="text-slate-400">{transportText}</dt>
          <dd className="text-slate-100 capitalize">{status.transport.replace('-', ' ')}</dd>
        </div>
      </dl>
    </Card>
  )
}
