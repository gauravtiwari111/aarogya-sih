import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../hooks/AppContext'

export function Toasts() {
  const { toasts, dismissToast } = useApp()
  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[60] flex w-[min(92vw,360px)] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((item) => (
          <motion.button
            key={item.id}
            type="button"
            initial={{ opacity: 0, y: -8, x: 12 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -8, x: 12 }}
            className="pointer-events-auto rounded-2xl bg-navy/95 px-4 py-3 text-left text-white shadow-lg backdrop-blur"
            onClick={() => dismissToast(item.id)}
          >
            {item.message}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}
