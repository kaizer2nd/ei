import { AlertTriangle } from 'lucide-react'
import { Card } from './Card'
import type { Recommendation } from '../types'
import { classForPriority } from '../utils'

type RecommendationPanelProps = {
  title: string
  priorityText: string
  items: Recommendation[]
}

export function RecommendationPanel({ title, priorityText, items }: RecommendationPanelProps) {
  return (
    <Card title={title} icon={<AlertTriangle className="h-4 w-4" strokeWidth={1.5} />}>
      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className={`rounded-2xl px-4 py-3 ${classForPriority(item.priority)}`}>
            <p className="text-[14px] leading-6 font-medium text-slate-50">{item.text}</p>
            <p className="mt-2 text-xs text-slate-400">
              {priorityText}: {item.priority}
            </p>
          </article>
        ))}
      </div>
    </Card>
  )
}
