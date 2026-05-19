import { Sparkles } from 'lucide-react'
import { Card } from './Card'
import type { Prediction } from '../types'
import { classForConfidence } from '../utils'

type PredictionPanelProps = {
  title: string
  confidenceText: string
  items: Prediction[]
}

export function PredictionPanel({ title, confidenceText, items }: PredictionPanelProps) {
  return (
    <Card title={title} icon={<Sparkles className="h-4 w-4" strokeWidth={1.5} />}>
      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl bg-white/4 px-4 py-3">
            <p className="text-[14px] leading-6 text-slate-100">{item.text}</p>
            <p className="mt-2 text-xs text-slate-400">
              {confidenceText}:{' '}
              <span className={`font-semibold ${classForConfidence(item.confidence)}`}>{item.confidence}</span>
            </p>
          </article>
        ))}
      </div>
    </Card>
  )
}
