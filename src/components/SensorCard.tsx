import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Card } from './Card'

type SensorCardProps = {
  label: string
  value: string
  status: 'good' | 'alert'
  icon: ReactNode
  updatedAt: string
}

export function SensorCard({ label, value, status, icon, updatedAt }: SensorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      whileHover={{ y: -4, scale: 1.01 }}
    >
      <Card title={label} icon={<span className="text-slate-500">{icon}</span>} className="h-full min-h-[154px]">
        <div className="space-y-4">
          <motion.p
            key={value}
            initial={{ scale: 0.98, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
            className={status === 'good' ? 'text-[clamp(2.2rem,3vw,3.35rem)] font-semibold tracking-[-0.06em] text-slate-50' : 'text-[clamp(2.2rem,3vw,3.35rem)] font-semibold tracking-[-0.06em] text-slate-50'}
          >
            {value}
          </motion.p>
          <p className="text-xs text-slate-400">Updated {updatedAt}</p>
        </div>
      </Card>
    </motion.div>
  )
}
