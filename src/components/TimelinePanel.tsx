import { History } from 'lucide-react'
import { Card } from './Card'
import type { TimelineEvent } from '../types'
import { classForPriority, formatDateTime } from '../utils'

type TimelinePanelProps = {
  title: string
  events: TimelineEvent[]
}

export function TimelinePanel({ title, events }: TimelinePanelProps) {
  return (
    <Card title={title} icon={<History className="h-4 w-4" strokeWidth={1.5} />}>
      <div className="space-y-5">
        {events.map((event) => (
          <div key={event.id} className="relative pl-6">
            <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-[#0A84FF]" />
            <span className="absolute left-[4px] top-4 h-full w-px bg-white/8" />
            <p className="text-xs text-slate-500">{formatDateTime(event.timestamp)}</p>
            <p className="mt-1 text-[14px] font-medium tracking-[-0.01em] text-slate-50">{event.title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">{event.description}</p>
            <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs ${classForPriority(event.severity)}`}>
              {event.severity}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
