import { motion } from 'framer-motion'

export function ProgressIndicator({ current, total, label }: { current: number; total: number; label: string }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm font-medium text-muted">
        <span>{label}</span>
        <span>
          {current} / {total}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-teal-400"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
