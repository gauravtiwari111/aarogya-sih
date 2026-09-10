import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { t, type TranslationKey } from '../data/translations'
import { historyFromAnswers } from '../services/summaryService'
import type {
  AccessibilityPrefs,
  ClinicalHistory,
  ConversationAnswer,
  ConversationMessage,
  DocumentRecord,
  Language,
  PatientDraft,
  TimelineEvent,
  WorkflowStep,
} from '../types'
import { loadJson, saveJson } from '../utils/storage'

export interface ToastItem {
  id: number
  message: string
}

interface SessionState {
  step: WorkflowStep
  consent: boolean
  draft: PatientDraft
  answers: ConversationAnswer[]
  messages: ConversationMessage[]
  documents: DocumentRecord[]
  timeline: TimelineEvent[]
  history: ClinicalHistory | null
  selectedPatientId: string
  verified: boolean
  submitted?: boolean
}

const defaultDraft: PatientDraft = {
  name: '',
  age: '',
  gender: '',
  phone: '',
  abhaId: '',
}

const defaultA11y: AccessibilityPrefs = {
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  readAloud: false,
}

const defaultSession: SessionState = {
  step: 'welcome',
  consent: false,
  draft: defaultDraft,
  answers: [],
  messages: [],
  documents: [],
  timeline: [],
  history: null,
  selectedPatientId: 'PTH100125',
  verified: false,
  submitted: false,
}

interface AppContextValue {
  lang: Language
  setLang: (lang: Language) => void
  a11y: AccessibilityPrefs
  setA11y: (patch: Partial<AccessibilityPrefs>) => void
  session: SessionState
  setSession: (patch: Partial<SessionState>) => void
  resetSession: (patientId?: string, name?: string) => void
  tr: (key: TranslationKey) => string
  toasts: ToastItem[]
  toast: (message: string) => void
  dismissToast: (id: number) => void
  syncHistoryFromAnswers: () => ClinicalHistory
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => loadJson('lang', 'en'))
  const [a11y, setA11yState] = useState<AccessibilityPrefs>(() => loadJson('a11y', defaultA11y))
  const [session, setSessionState] = useState<SessionState>(() => loadJson('session', defaultSession))
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    saveJson('lang', lang)
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en'
  }, [lang])

  useEffect(() => {
    saveJson('a11y', a11y)
    const root = document.documentElement
    root.dataset.font = a11y.fontSize
    root.dataset.contrast = a11y.highContrast ? 'high' : 'normal'
    root.dataset.motion = a11y.reducedMotion ? 'reduce' : 'full'
  }, [a11y])

  useEffect(() => {
    saveJson('session', session)
  }, [session])

  const setLang = useCallback((next: Language) => {
    setLangState(next)
  }, [])

  const setA11y = useCallback((patch: Partial<AccessibilityPrefs>) => {
    setA11yState((prev) => ({ ...prev, ...patch }))
  }, [])

  const setSession = useCallback((patch: Partial<SessionState>) => {
    setSessionState((prev) => ({ ...prev, ...patch }))
  }, [])

  const resetSession = useCallback((patientId?: string, name?: string) => {
    const nextId = patientId || `PTH${Math.floor(100000 + Math.random() * 900000)}`
    const freshSession: SessionState = {
      step: 'consent',
      consent: false,
      draft: {
        name: name || '',
        age: '',
        gender: '',
        phone: '',
        abhaId: '',
      },
      answers: [],
      messages: [],
      documents: [],
      timeline: [],
      history: null,
      selectedPatientId: nextId,
      verified: false,
      submitted: false,
    }
    setSessionState(freshSession)
    saveJson('session', freshSession)
  }, [])

  const tr = useCallback((key: TranslationKey) => t(lang, key), [lang])

  const toast = useCallback((message: string) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id))
    }, 2800)
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const syncHistoryFromAnswers = useCallback(() => {
    const history = historyFromAnswers(session.answers)
    setSessionState((prev) => ({ ...prev, history }))
    return history
  }, [session.answers])

  const value = useMemo(
    () => ({
      lang,
      setLang,
      a11y,
      setA11y,
      session,
      setSession,
      resetSession,
      tr,
      toasts,
      toast,
      dismissToast,
      syncHistoryFromAnswers,
    }),
    [lang, setLang, a11y, setA11y, session, setSession, resetSession, tr, toasts, toast, dismissToast, syncHistoryFromAnswers],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
