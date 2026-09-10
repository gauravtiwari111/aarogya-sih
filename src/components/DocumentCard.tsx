import { FileText, FlaskConical, ScrollText, Upload } from 'lucide-react'
import type { DocumentRecord } from '../types'
import { Card } from './Card'

const icons = {
  prescription: ScrollText,
  lab: FlaskConical,
  upload: Upload,
  discharge: FileText,
}

export function DocumentCard({
  doc,
  onOpen,
  actionLabel,
}: {
  doc: DocumentRecord
  onOpen?: () => void
  actionLabel?: string
}) {
  const Icon = icons[doc.kind]
  return (
    <Card className="flex min-w-[220px] flex-1 flex-col gap-2">
      <Icon className="text-primary" />
      <p className="font-semibold text-navy">{doc.title}</p>
      <p className="text-sm text-muted">{doc.date}</p>
      <p className="text-sm">{doc.preview}</p>
      {onOpen ? (
        <button type="button" className="mt-auto text-left font-semibold text-primary" onClick={onOpen}>
          {actionLabel ?? 'View'}
        </button>
      ) : null}
    </Card>
  )
}
