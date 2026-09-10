import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../utils/cx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'soft'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  icon?: ReactNode
}

const styles: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-dark shadow-sm',
  secondary:
    'bg-emerald-700 text-white hover:bg-emerald-800',
  ghost: 'bg-transparent text-primary hover:bg-primary-light',
  outline: 'border border-line bg-white text-ink hover:bg-slate-50',
  danger: 'bg-red-700 text-white hover:bg-red-800',
  soft: 'bg-primary-light text-primary-dark hover:bg-teal-100',
}

export function Button({ variant = 'primary', icon, className, children, type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-base font-semibold transition active:scale-[0.98] disabled:opacity-50',
        styles[variant],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}
