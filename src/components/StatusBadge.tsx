import type { AttentionLevel } from '../types'
import { cx } from '../utils/cx'

export function StatusBadge({ level, label }: { level: AttentionLevel; label: string }) {
  if (level === 'none' || !label) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800 ring-1 ring-emerald-100">
        Stable
      </span>
    )
  }
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ring-1',
        level === 'high' ? 'bg-red-50 text-red-800 ring-red-100' : 'bg-amber-50 text-amber-800 ring-amber-100',
      )}
    >
      ⚠ {label}
    </span>
  )
}
