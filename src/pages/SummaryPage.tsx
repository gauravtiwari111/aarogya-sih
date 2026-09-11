import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { SectionCard } from '../components/SectionCard'
import { SummaryCard } from '../components/SummaryCard'
import { Timeline } from '../components/Timeline'
import { PatientShell } from '../layouts/PatientLayout'
import { useApp } from '../hooks/AppContext'
import { generateClinicalSummary } from '../services/summaryService'
import { PRIMARY_PATIENT_ID } from '../data/demoData'

export function SummaryPage() {
  const { tr, session, setSession, toast } = useApp()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(!session.history)
  const [editing, setEditing] = useState(false)
  const history = session.history

  useEffect(() => {
    if (session.history) return
    let alive = true
    void generateClinicalSummary(PRIMARY_PATIENT_ID, session.answers).then((sum) => {
      if (!alive) return
      setSession({ history: sum.history })
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [session.answers, session.history, setSession])

  if (loading || !history) {
    return (
      <PatientShell>
        <Card className="mx-auto max-w-xl">{tr('preparingSummary')}</Card>
      </PatientShell>
    )
  }

  const name = session.draft.name || 'Rahul Sharma'
  const age = session.draft.age || '46'
  const gender = session.draft.gender || 'male'

  return (
    <PatientShell>
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold">{tr('summaryTitle')}</h1>
        <p className="rounded-2xl bg-amber-50 px-4 py-3 font-semibold text-amber-950">{tr('disclaimer')}</p>
        <p className="text-sm text-muted">{tr('safety')}</p>
        <SummaryCard title={tr('patient')}>
          {name} • {age} • {gender === 'male' ? tr('male') : gender === 'female' ? tr('female') : tr('other')}
        </SummaryCard>
        {editing ? (
          <div className="space-y-3">
            <Input
              label={tr('chiefComplaint')}
              value={history.chiefComplaint}
              onChange={(e) => setSession({ history: { ...history, chiefComplaint: e.target.value } })}
            />
            <label className="block">
              <span className="mb-1.5 block font-medium">{tr('hpi')}</span>
              <textarea
                className="w-full rounded-2xl border border-line p-3"
                rows={3}
                value={history.hpi}
                onChange={(e) => setSession({ history: { ...history, hpi: e.target.value } })}
              />
            </label>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryCard title={tr('chiefComplaint')}>
              {history.chiefComplaint} × {history.duration}
            </SummaryCard>
            <SummaryCard title={tr('hpi')}>{history.hpi}</SummaryCard>
            <SummaryCard title={tr('pastHistory')}>{history.pastHistory}</SummaryCard>
            <SummaryCard title={tr('medication')}>
              {history.medications.map((m) => m.name).join(', ') || '—'}
            </SummaryCard>
            <SummaryCard title={tr('allergies')}>{history.allergies}</SummaryCard>
            <SummaryCard title={tr('investigations')}>
              {history.investigations.length ? 'Previous blood report available' : '—'}
            </SummaryCard>
          </div>
        )}
        {history.attention.level !== 'none' ? (
          <Card className="border-amber-200 bg-amber-50">
            <p className="font-semibold">⚠ {tr('aiAttention')}</p>
            <p>{history.attention.message}</p>
          </Card>
        ) : null}
        <SectionCard title={tr('hpi')}>
          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Item k={tr('onset')} v={history.hpiDetails.onset} />
            <Item k={tr('location')} v={history.hpiDetails.location} />
            <Item k={tr('character')} v={history.hpiDetails.character} />
            <Item k={tr('duration')} v={history.hpiDetails.duration} />
            <Item k={tr('associated')} v={history.hpiDetails.associated} />
            <Item k={tr('aggravating')} v={history.hpiDetails.aggravating} />
            <Item k={tr('relieving')} v={history.hpiDetails.relieving} />
          </dl>
        </SectionCard>
        <SectionCard title={tr('pastHistory')}>{history.pastHistory}</SectionCard>
        <SectionCard title={tr('medication')}>
          {history.medications.map((m) => (
            <p key={m.name}>{[m.name, m.dosage, m.frequency].filter(Boolean).join(' · ')}</p>
          ))}
        </SectionCard>
        <SectionCard title={tr('allergies')}>{history.allergies}</SectionCard>
        <SectionCard title={tr('investigations')}>
          {history.investigations.map((inv) => (
            <p key={inv.name}>
              {inv.name}: {inv.value} ({inv.reference}) — {inv.status}
            </p>
          ))}
        </SectionCard>
        <SectionCard title={tr('aiAttention')}>{history.attention.message || '—'}</SectionCard>
        <SectionCard title={tr('documents')}>
          {session.documents.length === 0 ? tr('noDocs') : session.documents.map((d) => d.title).join(', ')}
        </SectionCard>
        <SectionCard title={tr('timeline')}>
          <Timeline events={session.timeline} />
        </SectionCard>
        <div className="flex flex-col gap-3">
          <Button variant="outline" onClick={() => setEditing(true)}>
            {tr('editInfo')}
          </Button>
          <Button
            onClick={async () => {
              const currentId = session.selectedPatientId || `PTH${Math.floor(100000 + Math.random() * 900000)}`
              toast(tr('submitted'))

              // Build patient record for Doctor Queue
              const fullRecord = {
                id: currentId,
                name,
                age: Number(age) || 30,
                gender: (gender as any) || 'male',
                phone: session.draft.phone || '9876543210',
                abhaId: session.draft.abhaId || `ABHA-${currentId.replace(/\D/g, '')}`,
                chiefComplaint: history.chiefComplaint,
                duration: history.duration,
                attention: history.attention.level,
                attentionNote: history.attention.message,
                lastUpdated: 'Just now',
                history: history,
                documents: session.documents,
                timeline: [
                  ...session.timeline,
                  {
                    id: `tl-sub-${Date.now()}`,
                    date: 'Today',
                    title: 'Intake Submitted',
                    subtitle: history.chiefComplaint,
                    kind: 'complaint' as const,
                  },
                ],
              }

              try {
                const { saveSubmittedPatient } = await import('../services/patientService')
                saveSubmittedPatient(fullRecord)
              } catch (e) {
                console.warn('Local queue save note:', e)
              }

              // Save to backend REST API database
              try {
                const { fetchJson } = await import('../services/api')
                await fetchJson('/patients/profile', {
                  method: 'PUT',
                  body: JSON.stringify({
                    patientId: currentId,
                    name,
                    age: Number(age) || 30,
                    gender,
                    phone: session.draft.phone || '9876543210',
                    abhaId: session.draft.abhaId || 'ABHA-9821-4410-1209',
                    history: session.history,
                  }),
                })
              } catch (e) {
                console.warn('Profile save note:', e)
              }

              setSession({ step: 'doctor', selectedPatientId: currentId, submitted: true })
              navigate('/success')
            }}
          >
            {tr('submitDoctor')}
          </Button>
        </div>
      </div>
    </PatientShell>
  )
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-sm text-muted">{k}</dt>
      <dd className="font-medium text-navy">{v}</dd>
    </div>
  )
}
