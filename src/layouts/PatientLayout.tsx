import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AccessibilityPanel } from '../components/AccessibilityPanel'
import { AudioButton } from '../components/AudioButton'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { useApp } from '../hooks/AppContext'

export function PatientHeader({ speakText }: { speakText?: string }) {
  const { tr, session } = useApp()
  const patientName = session.draft.name || localStorage.getItem('aarogya_last_user_name')

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-primary">
          <img src="/assets/logo.svg" alt="" className="h-9 w-9" />
          {tr('brand')}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {patientName ? (
            <span className="flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-900 border border-teal-200">
              👤 {patientName}
            </span>
          ) : null}
          <LanguageSwitcher />
          {speakText ? <AudioButton text={speakText} /> : null}
          <AccessibilityPanel />
        </div>
      </div>
    </header>
  )
}

export function PatientShell({ children, speakText }: { children: ReactNode; speakText?: string }) {
  return (
    <div className="min-h-svh bg-page">
      <PatientHeader speakText={speakText} />
      <main className="mx-auto w-full max-w-5xl px-4 py-6">{children}</main>
    </div>
  )
}
