import { motion, type HTMLMotionProps } from 'framer-motion'
import { cx } from '../utils/cx'

export function Card({ className, ...rest }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
      className={cx(
        'rounded-2xl border border-line bg-card p-5 shadow-[0_8px_24px_rgba(18,38,58,0.06)] transition-shadow hover:shadow-[0_14px_32px_rgba(18,38,58,0.1)]',
        className,
      )}
      {...rest}
    />
  )
}
