import type { PropsWithChildren, ReactNode } from 'react'
import { clsx } from 'clsx'

type CardProps = PropsWithChildren<{
  title?: string
  subtitle?: string
  icon?: ReactNode
  className?: string
}>

export function Card({ title, subtitle, icon, className, children }: CardProps) {
  return (
    <section
      className={clsx(
        'group rounded-[22px] bg-white/5 p-5 shadow-[0_18px_60px_-34px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/6 hover:shadow-[0_26px_70px_-38px_rgba(0,0,0,0.95)] md:p-6',
        className,
      )}
    >
      {(title || subtitle || icon) && (
        <header className="mb-5 flex items-start justify-between gap-3">
          <div>
            {title ? <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-100">{title}</h3> : null}
            {subtitle ? <p className="mt-1 text-xs leading-5 text-slate-400">{subtitle}</p> : null}
          </div>
          {icon ? <div className="text-slate-400 transition group-hover:text-slate-200">{icon}</div> : null}
        </header>
      )}
      {children}
    </section>
  )
}
