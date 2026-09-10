import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { DEMO_PATIENTS, PRIMARY_PATIENT_ID } from '../data/demoData'
import { useApp } from '../hooks/AppContext'
import { confirmClinicalHistory, updateClinicalSummary } from '../services/summaryService'

export function DoctorReviewPage() {
  const { tr, session, setSession, toast } = useApp()
  const navigate = useNavigate()
  const patient = DEMO_PATIENTS.find((p) => p.id === session.selectedPatientId) ?? DEMO_PATIENTS[0]
  const initial = session.selectedPatientId === PRIMARY_PATIENT_ID && session.history ? session.history : patient.history
  const [form, setForm] = useState(initial)
  const [editing, setEditing] = useState(false)
  const [keepFlag, setKeepFlag] = useState(form.attention.level !== 'none')

  const name = useMemo(() => {
    if (session.selectedPatientId === PRIMARY_PATIENT_ID && session.draft.name) return session.draft.name
    return patient.name
  }, [patient.name, session.draft.name, session.selectedPatientId])

  async function save() {
    const history = {
      ...form,
      attention: keepFlag ? form.attention : { level: 'none' as const, message: '' },
    }
    await updateClinicalSummary(history)
    await confirmClinicalHistory({
      patientId: patient.id,
      accepted: true,
      notes: '',
      history,
    })
    setSession({ history, verified: true, step: 'doctor' })
    toast(tr('reviewSaved'))
    navigate('/success')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h2 className="text-2xl font-bold">{tr('review')}</h2>
      <p className="rounded-2xl bg-amber-50 px-4 py-3 font-semibold text-amber-950">{tr('disclaimer')}</p>
      <Card>
        <p className="text-sm text-muted">{tr('patient')}</p>
        <p className="text-xl font-semibold">{name}</p>
      </Card>
      {editing ? (
        <div className="space-y-3">
          <Input label={tr('chiefComplaint')} value={form.chiefComplaint} onChange={(e) => setForm({ ...form, chiefComplaint: e.target.value })} />
          <label className="block">
            <span className="mb-1.5 block font-medium">{tr('hpi')}</span>
            <textarea
              className="w-full rounded-2xl border border-line p-3"
              rows={4}
              value={form.hpi}
              onChange={(e) => setForm({ ...form, hpi: e.target.value })}
            />
          </label>
          <Input label={tr('pastHistory')} value={form.pastHistory} onChange={(e) => setForm({ ...form, pastHistory: e.target.value })} />
        </div>
      ) : (
        <div className="space-y-3">
          <Field label={tr('chiefComplaint')} value={`${form.chiefComplaint} × ${form.duration}`} />
          <Field label={tr('hpi')} value={form.hpi} />
          <Field label={tr('pastHistory')} value={form.pastHistory} />
        </div>
      )}
      <Card className="border-amber-200">
        <p className="font-semibold">{tr('aiAttention')}</p>
        <p className="mb-3">{form.attention.message || '—'}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant={keepFlag ? 'primary' : 'outline'} onClick={() => setKeepFlag(true)}>
            {tr('acceptFlag')}
          </Button>
          <Button variant={!keepFlag ? 'primary' : 'outline'} onClick={() => setKeepFlag(false)}>
            {tr('rejectFlag')}
          </Button>
        </div>
      </Card>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" onClick={() => setEditing(true)}>
          ✎ {tr('editSummary')}
        </Button>
        <Button className="flex-1" onClick={() => void save()}>
          ✓ {tr('confirmSave')}
        </Button>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm text-muted">{label}</p>
      <p className="text-lg font-medium text-navy">{value}</p>
    </Card>
  )
}
