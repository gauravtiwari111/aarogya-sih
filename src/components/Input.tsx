import type { InputHTMLAttributes } from 'react'
import { cx } from '../utils/cx'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, id, className, ...rest }: Props) {
  const inputId = id ?? label.replace(/\s+/g, '-').toLowerCase()
  return (
    <label className="block" htmlFor={inputId}>
      <span className="mb-1.5 block font-medium text-navy">{label}</span>
      <input
        id={inputId}
        className={cx(
          'w-full rounded-2xl border border-line bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15',
          error && 'border-red-600',
          className,
        )}
        {...rest}
      />
      {error ? <span className="mt-1 block text-sm text-red-700">{error}</span> : null}
    </label>
  )
}
