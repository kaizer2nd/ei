import { motion } from 'framer-motion'

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0f17] px-6 text-slate-100">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md rounded-[28px] bg-white/5 p-8 text-center shadow-[0_24px_80px_-44px_rgba(0,0,0,0.95)] backdrop-blur-2xl"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            className="h-8 w-8 rounded-full border-2 border-white/15 border-t-[#0A84FF]"
          />
        </div>

        <h1 className="mt-6 text-[24px] font-semibold tracking-[-0.03em] text-slate-50">DroneFarm AI</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">Preparing live farm telemetry</p>

        <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-white/8">
          <motion.div
            initial={{ x: '-30%' }}
            animate={{ x: '130%' }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-[#0A84FF] to-transparent"
          />
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3 text-left">
          <div className="rounded-2xl bg-white/4 p-3">
            <p className="text-[11px] text-slate-500">Sensors</p>
            <p className="mt-1 text-sm text-slate-100">Syncing</p>
          </div>
          <div className="rounded-2xl bg-white/4 p-3">
            <p className="text-[11px] text-slate-500">Bridge</p>
            <p className="mt-1 text-sm text-slate-100">Connecting</p>
          </div>
          <div className="rounded-2xl bg-white/4 p-3">
            <p className="text-[11px] text-slate-500">UI</p>
            <p className="mt-1 text-sm text-slate-100">Loading</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
