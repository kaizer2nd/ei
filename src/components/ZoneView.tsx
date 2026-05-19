import { MapPinned } from 'lucide-react'
import { Card } from './Card'
import type { ZoneSnapshot } from '../types'
import { classForZone } from '../utils'

type ZoneViewProps = {
  title: string
  zones: ZoneSnapshot[]
}

export function ZoneView({ title, zones }: ZoneViewProps) {
  return (
    <Card title={title} icon={<MapPinned className="h-4 w-4" />}>
      <div className="grid gap-3 md:grid-cols-3">
        {zones.map((zone) => (
          <article key={zone.zone} className={`rounded-2xl px-4 py-4 ${classForZone(zone.status)}`}>
            <p className="text-xs text-slate-400">{zone.zone}</p>
            <p className="mt-2 text-[17px] font-medium tracking-[-0.02em] text-slate-50">{zone.status}</p>
          </article>
        ))}
      </div>
    </Card>
  )
}
