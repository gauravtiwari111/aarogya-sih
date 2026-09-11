import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, Clock3, Users } from 'lucide-react'
import { Card } from '../components/Card'
import { PatientQueue } from '../components/PatientQueue'
import { useApp } from '../hooks/AppContext'
import { getDeletedPatientIds, getPatients, removePatient } from '../services/patientService'
import type { Patient } from '../types'

export function DoctorDashboardPage() {
  const { tr, session, setSession, toast, a11y, setA11y } = useApp()
  const [params] = useSearchParams()
  const view = params.get('view') ?? 'dashboard'
  const [query, setQuery] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])

  useEffect(() => {
    void getPatients().then((list) => {
      setPatients(list)
    })
  }, [])

  function handleDelete(patientId: string) {
    removePatient(patientId)
    if (session.selectedPatientId === patientId) {
      setSession({ selectedPatientId: '' })
    }
    setPatients((prev) => prev.filter((p) => p.id !== patientId))
    toast(`Patient ${patientId} deleted permanently from queue`)
  }

  const merged = useMemo(() => {
    const activeId = session.selectedPatientId
    const deletedSet = new Set(getDeletedPatientIds())

    const list = patients.map((p) => {
      if (!session.submitted || !activeId || p.id !== activeId || !session.history) return p
      return {
        ...p,
        name: session.draft.name || p.name,
        age: Number(session.draft.age) || p.age,
        gender: session.draft.gender || p.gender,
        phone: session.draft.phone || p.phone,
        abhaId: session.draft.abhaId || p.abhaId,
        chiefComplaint: session.history.chiefComplaint,
        duration: session.history.duration,
        attention: session.history.attention.level,
        attentionNote: session.history.attention.message,
        history: session.history,
        documents: session.documents.length ? session.documents : p.documents,
        timeline: session.timeline.length ? session.timeline : p.timeline,
      }
    })

    if (session.submitted && activeId && !deletedSet.has(activeId) && !list.some((p) => p.id === activeId) && session.history) {
      list.unshift({
        id: activeId,
        name: session.draft.name || 'New Patient Intake',
        age: Number(session.draft.age) || 30,
        gender: session.draft.gender || 'male',
        phone: session.draft.phone || '9876543210',
        abhaId: session.draft.abhaId || `ABHA-${activeId.replace(/\D/g, '')}`,
        chiefComplaint: session.history.chiefComplaint,
        duration: session.history.duration,
        attention: session.history.attention.level,
        attentionNote: session.history.attention.message,
        lastUpdated: 'Just now',
        history: session.history,
        documents: session.documents,
        timeline: session.timeline,
      })
    }

    return list.filter((p) => !deletedSet.has(p.id))
  }, [patients, session])

  const flagged = merged.filter((p) => p.attention !== 'none').length

  if (view === 'settings') {
    return (
      <div className="grid gap-4 md:max-w-2xl">
        <Card>
          <h2 className="text-xl font-bold text-navy">{tr('settings')}</h2>
          <p className="mt-2 text-muted">{tr('settingsBody')}</p>
        </Card>
        <Card className="space-y-3">
          <p className="font-semibold">Reduced motion</p>
          <button
            className="rounded-2xl bg-primary px-4 py-2 font-semibold text-white"
            onClick={() => setA11y({ reducedMotion: !a11y.reducedMotion })}
          >
            {a11y.reducedMotion ? tr('on') : tr('off')}
          </button>
        </Card>
      </div>
    )
  }
  if (view === 'patients') {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-navy">{tr('patients')}</h2>
        <p className="text-muted">Search and open a patient record from today’s queue.</p>
        <PatientQueue patients={merged} query={query} onQuery={setQuery} onDeletePatient={handleDelete} />
      </div>
    )
  }
  if (view === 'history') {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-navy">{tr('history')}</h2>
        <p className="text-muted">{tr('historyBody')}</p>
        <PatientQueue patients={merged} query={query} onQuery={setQuery} />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat icon={Users} label="In queue" value={String(merged.length)} delay={0} />
        <Stat icon={AlertTriangle} label="Needs attention" value={String(flagged)} delay={0.06} />
        <Stat icon={Clock3} label="Latest" value={merged[0]?.lastUpdated || '—'} delay={0.12} />
      </div>
      <h2 className="text-2xl font-bold text-navy">{tr('queue')}</h2>
      <PatientQueue patients={merged} query={query} onQuery={setQuery} onDeletePatient={handleDelete} />
    </div>
  )
}

function Stat({ icon: Icon, label, value, delay = 0 }: { icon: typeof Users; label: string; value: string; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-light text-primary">
          <Icon size={20} />
        </span>
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="text-xl font-bold text-navy">{value}</p>
        </div>
      </Card>
    </motion.div>
  )
}
