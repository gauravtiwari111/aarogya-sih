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
      <div className="h-2 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
