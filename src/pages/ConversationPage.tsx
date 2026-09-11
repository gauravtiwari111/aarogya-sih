import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AudioButton } from '../components/AudioButton'
import { Button } from '../components/Button'
import { AIMessage, PatientMessage } from '../components/Messages'
import { ProgressIndicator } from '../components/ProgressIndicator'
import { VoiceInput } from '../components/VoiceInput'
import { QUESTIONS } from '../data/demoData'
import { PatientShell } from '../layouts/PatientLayout'
import { useApp } from '../hooks/AppContext'
import { submitConversation } from '../services/conversationService'
import { speak } from '../services/speechService'
import type { ConversationAnswer } from '../types'
import { cx } from '../utils/cx'

export function ConversationPage() {
  const { lang, tr, session, setSession, a11y } = useApp()
  const navigate = useNavigate()
  const [index, setIndex] = useState(() => Math.min(session.answers.length, QUESTIONS.length - 1))
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const question = QUESTIONS[index]
  const prompt = lang === 'hi' ? question.promptHi : question.promptEn
  const answers = session.answers

  useEffect(() => {
    if (a11y.readAloud) speak(prompt, lang)
  }, [a11y.readAloud, prompt, lang])

  useEffect(() => {
    const existing = answers.find((a) => a.questionId === question.id)?.value ?? ''
    setDraft(existing)
  }, [index, question.id])

  const currentAnswer = answers.find((a) => a.questionId === question.id)?.value ?? draft

  const attention = useMemo(() => {
    const breath = answers.find((a) => a.questionId === 'q5')?.value ?? ''
    return /breath/i.test(breath) && !/none/i.test(breath)
  }, [answers])

  function upsert(value: string) {
    const next: ConversationAnswer[] = [
      ...answers.filter((a) => a.questionId !== question.id),
      { questionId: question.id, value },
    ]
    const messages = [
      ...session.messages.filter((m) => m.questionId !== question.id),
      { id: `ai-${question.id}`, role: 'ai' as const, text: prompt, questionId: question.id },
      { id: `pt-${question.id}`, role: 'patient' as const, text: value, questionId: question.id },
    ]
    setSession({ answers: next, messages })
    setDraft(value)
  }

  async function goNext(skip = false) {
    if (!skip && !currentAnswer) return
    if (index >= QUESTIONS.length - 1) {
      setBusy(true)
      await submitConversation(session.answers, session.selectedPatientId)
      setBusy(false)
      setSession({ step: 'verification' })
      navigate('/verification')
      return
    }
    setIndex((i) => i + 1)
    setDraft('')
  }

  return (
    <PatientShell speakText={prompt}>
      <div className="mx-auto max-w-xl space-y-4">
        <ProgressIndicator current={index + 1} total={QUESTIONS.length} label={tr('healthHistory')} />
        {attention ? (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-amber-50 px-4 py-3 font-medium text-amber-900 ring-1 ring-amber-100"
          >
            ⚠ {tr('aiAttention')}
          </motion.p>
        ) : null}
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.28 }}
            className="space-y-4"
          >
            <AIMessage text={prompt} />
            <div className="flex gap-2">
              <AudioButton text={prompt} />
              <Button
                variant="outline"
                onClick={() => {
                  speak(prompt, lang)
                }}
              >
                {tr('repeat')}
              </Button>
            </div>
            {currentAnswer ? <PatientMessage text={currentAnswer} /> : null}
            {busy ? <p className="text-muted">{tr('understanding')}</p> : null}
            <p className="text-sm text-muted">{tr('tapHint')}</p>
            <div className="flex flex-wrap gap-2">
              {question.tapOptions.map((opt) => {
                const selected = currentAnswer === opt.value
                return (
                  <Button
                    key={opt.value + opt.label}
                    variant={selected ? 'primary' : 'outline'}
                    className={cx(selected && 'ring-2 ring-primary/30')}
                    onClick={() => upsert(opt.value)}
                  >
                    {lang === 'hi' ? opt.labelHi : opt.label}
                  </Button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
        <VoiceInput
          onResult={(text) => {
            upsert(text)
          }}
        />
        <label className="block">
          <span className="mb-1 block text-sm font-medium">{tr('yourAnswer')}</span>
          <textarea
            className="w-full rounded-2xl border border-line p-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            rows={2}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              upsert(e.target.value)
            }}
          />
        </label>
        <div className="flex gap-3">
          {index > 0 ? (
            <Button variant="ghost" onClick={() => setIndex((i) => Math.max(0, i - 1))}>
              {tr('back')}
            </Button>
          ) : null}
          <Button variant="ghost" onClick={() => void goNext(true)}>
            {tr('skip')}
          </Button>
          <Button className="flex-1" disabled={!currentAnswer || busy} onClick={() => void goNext(false)}>
            {tr('continue')}
          </Button>
        </div>
      </div>
    </PatientShell>
  )
}
