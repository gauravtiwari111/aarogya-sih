import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Button } from './Button'

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="presentation">
      <button className="absolute inset-0 bg-navy/40" aria-label="Close dialog" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative z-10 w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="modal-title" className="text-xl font-semibold text-navy">
            {title}
          </h2>
          <Button variant="ghost" className="min-h-11 px-3" onClick={onClose} aria-label="Close">
            <X size={20} />
          </Button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
