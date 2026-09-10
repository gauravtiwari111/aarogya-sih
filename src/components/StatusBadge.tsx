import type { AttentionLevel } from '../types'
import { cx } from '../utils/cx'

export function StatusBadge({ level, label }: { level: AttentionLevel; label: string }) {
  if (level === 'none' || !label) {
    return <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">Stable</span>
  }
  return (
    <span
      className={cx(
        'rounded-full px-3 py-1 text-sm font-semibold',
        level === 'high' ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800',
      )}
    >
      ⚠ {label}
    </span>
  )
}
