import { motion } from 'framer-motion'
import type { TimelineEvent } from '../types'
import { Card } from './Card'

export function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) return null
  return (
    <ol className="relative space-y-4 border-l-2 border-primary-light pl-6">
      {events.map((event, i) => (
        <motion.li
          key={event.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          <span className="absolute -left-[9px] mt-2 h-4 w-4 rounded-full border-2 border-white bg-primary" />
          <Card className="p-4">
            <p className="text-sm text-muted">{event.date}</p>
            <p className="font-semibold text-navy">{event.title}</p>
            <p>{event.subtitle}</p>
          </Card>
        </motion.li>
      ))}
    </ol>
  )
}
