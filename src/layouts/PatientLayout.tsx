import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AccessibilityPanel } from '../components/AccessibilityPanel'
import { AudioButton } from '../components/AudioButton'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { useApp } from '../hooks/AppContext'

export function PatientHeader({ speakText }: { speakText?: string }) {
  const { tr } = useApp()
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-primary">
          <img src="/assets/logo.svg" alt="" className="h-9 w-9" />
          {tr('brand')}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
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
