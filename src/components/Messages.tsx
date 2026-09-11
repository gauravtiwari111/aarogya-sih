import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'
import { Card } from './Card'

export function AIMessage({ text }: { text: string }) {
  return (
    <motion.div key={text} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
      <Card className="border-teal-100 bg-primary-light">
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-dark">
          <Bot size={16} /> AAROGYA
        </p>
        <p className="text-lg leading-relaxed text-navy">{text}</p>
      </Card>
    </motion.div>
  )
}

export function PatientMessage({ text }: { text: string }) {
  return (
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
      <Card className="ml-auto max-w-[92%] border-blue-100 bg-white">
        <p className="mb-1 text-sm font-semibold text-muted">You</p>
        <p className="text-lg text-navy">{text}</p>
      </Card>
    </motion.div>
  )
}
