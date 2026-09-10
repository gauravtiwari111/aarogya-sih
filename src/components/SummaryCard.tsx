import type { ReactNode } from 'react'
import { Card } from './Card'

export function SummaryCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <p className="mb-1 text-sm font-medium text-muted">{title}</p>
      <div className="text-lg font-semibold text-navy">{children}</div>
    </Card>
  )
}
