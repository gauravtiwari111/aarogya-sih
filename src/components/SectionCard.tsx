import { ChevronDown } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Card } from './Card'

export function SectionCard({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Card className="p-0">
      <button
        type="button"
        className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold text-navy"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {title}
        <ChevronDown className={`transition ${open ? 'rotate-180' : ''}`} size={20} />
      </button>
      {open ? <div className="border-t border-line px-5 py-4 text-muted">{children}</div> : null}
    </Card>
  )
}
