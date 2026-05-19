import { LayoutDashboard, BarChart3, Brain, Settings } from 'lucide-react'
import type { ComponentType } from 'react'
import type { NavView } from '../types'
import { clsx } from 'clsx'

type SidebarProps = {
  current: NavView
  onChange: (view: NavView) => void
  labels: Record<NavView, string>
}

const navItems: Array<{ key: NavView; icon: ComponentType<{ className?: string }> }> = [
  { key: 'dashboard', icon: LayoutDashboard },
  { key: 'analytics', icon: BarChart3 },
  { key: 'intelligence', icon: Brain },
  { key: 'settings', icon: Settings },
]

export function Sidebar({ current, onChange, labels }: SidebarProps) {
  return (
    <aside className="sticky top-0 h-screen w-full max-w-[280px] bg-black/10 px-4 py-5 backdrop-blur-2xl">
      <div className="mb-8 px-2">
        <p className="text-[15px] font-semibold tracking-[-0.02em] text-slate-100">DroneFarm AI</p>
        <p className="mt-1 text-xs text-slate-400">Precision crop intelligence</p>
      </div>

      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = current === item.key
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={clsx(
                'group relative flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-all duration-300 ease-out',
                active ? 'bg-white/8 text-white shadow-[0_12px_28px_-18px_rgba(0,0,0,0.8)]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100',
              )}
            >
              {active ? <span className="absolute left-0 top-2 h-[calc(100%-16px)] w-0.5 rounded-full bg-[#0A84FF]" /> : null}
              <Icon className={clsx('h-4 w-4', active ? 'text-[#8ec5ff]' : 'text-slate-500 group-hover:text-slate-300')} />
              <span className="text-[14px] font-medium tracking-[-0.01em]">{labels[item.key]}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
