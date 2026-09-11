import type { ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cx } from '../utils/cx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'soft'

interface Props extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant
  icon?: ReactNode
  children?: ReactNode
}

const styles: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark shadow-sm shadow-teal-900/10',
  secondary: 'bg-emerald-700 text-white hover:bg-emerald-800',
  ghost: 'bg-transparent text-primary hover:bg-primary-light',
  outline: 'border border-line bg-white/90 text-ink hover:bg-slate-50 hover:border-primary/40',
  danger: 'bg-red-700 text-white hover:bg-red-800',
  soft: 'bg-primary-light text-primary-dark hover:bg-teal-100',
}

export function Button({ variant = 'primary', icon, className, children, type = 'button', disabled, ...rest }: Props) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-base font-semibold transition-colors disabled:opacity-50',
        styles[variant],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </motion.button>
  )
}
