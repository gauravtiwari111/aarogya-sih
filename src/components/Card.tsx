import type { HTMLAttributes } from 'react'
import { cx } from '../utils/cx'

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx('rounded-2xl border border-line bg-card p-5 shadow-[0_8px_24px_rgba(18,38,58,0.06)]', className)}
      {...rest}
    />
  )
}
