import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AccessibilityPanel } from '../components/AccessibilityPanel'
import { AudioButton } from '../components/AudioButton'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { PageTransition } from '../components/PageTransition'
import { useApp } from '../hooks/AppContext'
import { cx } from '../utils/cx'

const flow = [
  { step: 'consent', label: 'Consent' },
  { step: 'details', label: 'Details' },
  { step: 'conversation', label: 'History' },
  { step: 'verification', label: 'Verify' },
  { step: 'documents', label: 'Documents' },
  { step: 'summary', label: 'Summary' },
] as const

export function PatientHeader({ speakText }: { speakText?: string }) {
  const { tr, session } = useApp()
  const patientName = session.draft.name || localStorage.getItem('aarogya_last_user_name')
  const currentIndex = Math.max(
    0,
    flow.findIndex((item) => item.step === session.step),
  )

  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-primary">
          <img src="/assets/logo.svg" alt="" className="h-9 w-9" />
          {tr('brand')}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {patientName ? (
            <span className="flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-900">
              👤 {patientName}
            </span>
          ) : null}
          <LanguageSwitcher />
          {speakText ? <AudioButton text={speakText} /> : null}
          <AccessibilityPanel />
        </div>
      </div>
      {session.step !== 'welcome' && session.step !== 'doctor' ? (
        <div className="mx-auto hidden max-w-5xl gap-2 px-4 pb-3 sm:flex">
          {flow.map((item, i) => (
            <div key={item.step} className="min-w-0 flex-1">
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={false}
                  animate={{ width: i <= currentIndex ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
              <p
                className={cx(
                  'mt-1 truncate text-[11px] font-semibold',
                  i === currentIndex ? 'text-primary' : i < currentIndex ? 'text-navy' : 'text-muted',
                )}
              >
                {item.label}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </header>
  )
}

export function PatientShell({ children, speakText }: { children: ReactNode; speakText?: string }) {
  return (
    <div className="min-h-svh">
      <PatientHeader speakText={speakText} />
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  )
}
