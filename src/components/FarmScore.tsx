import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import { motion } from 'framer-motion'
import 'react-circular-progressbar/dist/styles.css'
import { Card } from './Card'
import type { FarmCondition } from '../types'
import { colorForCondition } from '../utils'

type FarmScoreProps = {
  score: number
  condition: FarmCondition
  title: string
  conditionLabelText: string
  conditionText: string
}

function tone(condition: FarmCondition): string {
  if (condition === 'Optimal') return '#34d399'
  if (condition === 'Moderate') return '#fbbf24'
  return '#f43f5e'
}

export function FarmScore({ score, condition, title, conditionLabelText, conditionText }: FarmScoreProps) {
  return (
    <Card title={title}>
      <motion.div
        className="mx-auto w-full max-w-[220px]"
        initial={{ opacity: 0.5, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
      >
        <CircularProgressbar
          value={score}
          text={`${score}`}
          styles={buildStyles({
            pathColor: tone(condition),
            textColor: '#f8fafc',
            trailColor: 'rgba(255,255,255,0.08)',
            pathTransitionDuration: 0.7,
            strokeLinecap: 'round',
          })}
          strokeWidth={8}
        />
      </motion.div>
      <div className="mt-4 text-center">
        <p className="text-xs text-slate-400">{conditionLabelText}</p>
        <p className={`mt-1 text-sm font-medium ${colorForCondition(condition)}`}>{conditionText}</p>
      </div>
    </Card>
  )
}
