import { useState } from 'react'
import { Accessibility, Volume2 } from 'lucide-react'
import { useApp } from '../hooks/AppContext'
import { Button } from './Button'
import { Modal } from './Modal'

export function AccessibilityPanel() {
  const { a11y, setA11y, toast, tr } = useApp()
  const [open, setOpen] = useState(false)

  function update<K extends keyof typeof a11y>(key: K, value: (typeof a11y)[K]) {
    setA11y({ [key]: value })
    toast(tr('a11yChanged'))
  }

  return (
    <>
      <Button variant="outline" className="gap-2 px-3" onClick={() => setOpen(true)} aria-label={tr('accessibility')}>
        <Accessibility size={18} />
        <span className="hidden sm:inline">{tr('accessibility')}</span>
      </Button>
      <Modal open={open} title={tr('accessibility')} onClose={() => setOpen(false)}>
        <div className="space-y-6">
          <fieldset>
            <legend className="mb-2 font-semibold">{tr('fontSize')}</legend>
            <div className="flex gap-2">
              {([
                ['small', tr('small')],
                ['medium', tr('medium')],
                ['large', tr('large')],
              ] as const).map(([size, label]) => (
                <Button
                  key={size}
                  variant={a11y.fontSize === size ? 'primary' : 'outline'}
                  onClick={() => update('fontSize', size)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </fieldset>
          {(
            [
              ['highContrast', tr('highContrast')],
              ['reducedMotion', tr('reducedMotion')],
              ['readAloud', tr('readAloud')],
            ] as const
          ).map(([key, label]) => (
            <fieldset key={key}>
              <legend className="mb-2 font-semibold">{label}</legend>
              <div className="flex gap-2">
                <Button variant={!a11y[key] ? 'primary' : 'outline'} onClick={() => update(key, false)}>
                  {tr('off')}
                </Button>
                <Button variant={a11y[key] ? 'primary' : 'outline'} onClick={() => update(key, true)}>
                  {tr('on')}
                </Button>
              </div>
            </fieldset>
          ))}
          <p className="flex items-center gap-2 text-sm text-muted">
            <Volume2 size={16} /> {tr('safety')}
          </p>
        </div>
      </Modal>
    </>
  )
}
