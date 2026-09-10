import { useEffect, useMemo, useState } from 'react'
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
    setBusy(true)
    await submitConversation(session.answers)
    setBusy(false)
    if (index >= QUESTIONS.length - 1) {
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
          <p className="rounded-2xl bg-amber-50 px-4 py-3 font-medium text-amber-900">⚠ {tr('aiAttention')}</p>
        ) : null}
        <AIMessage text={prompt} />
        <div className="flex gap-2">
          <AudioButton text={prompt} />
          <Button variant="outline" onClick={() => upsert(currentAnswer)}>
            {tr('repeat')}
          </Button>
        </div>
        {currentAnswer ? <PatientMessage text={currentAnswer} /> : null}
        {busy ? <p className="text-muted">{tr('understanding')}</p> : null}
        <p className="text-sm text-muted">{tr('tapHint')}</p>
        <div className="flex flex-wrap gap-2">
          {question.tapOptions.map((opt) => (
            <Button key={opt.value + opt.label} variant="outline" onClick={() => upsert(opt.value)}>
              {lang === 'hi' ? opt.labelHi : opt.label}
            </Button>
          ))}
        </div>
        <VoiceInput
          onResult={(text) => {
            upsert(index === 0 ? text : text)
          }}
        />
        <label className="block">
          <span className="mb-1 block text-sm font-medium">{tr('yourAnswer')}</span>
          <textarea
            className="w-full rounded-2xl border border-line p-3"
            rows={2}
            value={draft || currentAnswer}
            onChange={(e) => {
              setDraft(e.target.value)
              upsert(e.target.value)
            }}
          />
        </label>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => void goNext(true)}>
            {tr('skip')}
          </Button>
          <Button className="flex-1" disabled={!currentAnswer} onClick={() => void goNext(false)}>
            {tr('continue')}
          </Button>
        </div>
      </div>
    </PatientShell>
  )
}
