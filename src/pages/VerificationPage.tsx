import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AudioButton } from '../components/AudioButton'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { SummaryCard } from '../components/SummaryCard'
import { PatientShell } from '../layouts/PatientLayout'
import { useApp } from '../hooks/AppContext'
import { historyFromAnswers } from '../services/summaryService'

export function VerificationPage() {
  const { tr, session, setSession, toast } = useApp()
  const navigate = useNavigate()
  const history = session.history ?? historyFromAnswers(session.answers)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    chiefComplaint: history.chiefComplaint,
    duration: history.duration,
    pattern: history.pattern,
    associatedSymptoms: history.associatedSymptoms,
    pastHistory: history.pastHistory,
  })

  const speak = `${tr('verifySubtitle')} ${form.chiefComplaint}, ${form.duration}, ${form.pattern}.`

  function save() {
    setSession({
      history: { ...history, ...form },
      step: 'documents',
    })
    toast(tr('infoUpdated'))
    navigate('/documents')
  }

  return (
    <PatientShell speakText={speak}>
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="text-2xl font-bold">{tr('verifyTitle')}</h1>
        <p className="text-muted">{tr('verifySubtitle')}</p>
        <AudioButton text={speak} />
        {editing ? (
          <div className="space-y-3">
            <Input label={tr('chiefComplaint')} value={form.chiefComplaint} onChange={(e) => setForm({ ...form, chiefComplaint: e.target.value })} />
            <Input label={tr('duration')} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            <Input label={tr('pattern')} value={form.pattern} onChange={(e) => setForm({ ...form, pattern: e.target.value })} />
            <Input label={tr('associated')} value={form.associatedSymptoms} onChange={(e) => setForm({ ...form, associatedSymptoms: e.target.value })} />
            <Input label={tr('medicalHistory')} value={form.pastHistory} onChange={(e) => setForm({ ...form, pastHistory: e.target.value })} />
          </div>
        ) : (
          <div className="grid gap-3">
            <SummaryCard title={tr('chiefComplaint')}>{form.chiefComplaint}</SummaryCard>
            <SummaryCard title={tr('duration')}>{form.duration}</SummaryCard>
            <SummaryCard title={tr('pattern')}>{form.pattern}</SummaryCard>
            <SummaryCard title={tr('associated')}>{form.associatedSymptoms}</SummaryCard>
            <SummaryCard title={tr('medicalHistory')}>{form.pastHistory}</SummaryCard>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <Button onClick={save}>✓ {tr('yesCorrect')}</Button>
          <Button variant="outline" onClick={() => setEditing(true)}>
            ✎ {tr('edit')}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setSession({ step: 'conversation' })
              navigate('/conversation')
            }}
          >
            🎙 {tr('tellAgain')}
          </Button>
        </div>
      </div>
    </PatientShell>
  )
}
