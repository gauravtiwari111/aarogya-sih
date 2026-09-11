import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card } from '../components/Card'
import { PatientQueue } from '../components/PatientQueue'
import { useApp } from '../hooks/AppContext'
import { getPatients } from '../services/patientService'
import type { Patient } from '../types'

export function DoctorDashboardPage() {
  const { tr, session } = useApp()
  const [params] = useSearchParams()
  const view = params.get('view') ?? 'dashboard'
  const [query, setQuery] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])

  useEffect(() => {
    void getPatients().then((list) => {
      setPatients(list)
    })
  }, [])

  const merged = useMemo(() => {
    const activeId = session.selectedPatientId

    // Map existing patient records
    const list = patients.map((p) => {
      if (!activeId || p.id !== activeId || !session.history) return p
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

    // If active session patient is new and not in array yet, unshift them to top of queue
    if (activeId && !list.some((p) => p.id === activeId) && session.history) {
      list.unshift({
        id: activeId,
        name: session.draft.name || 'New Patient Intake',
        age: Number(session.draft.age) || 30,
        gender: (session.draft.gender as any) || 'male',
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

    return list
  }, [patients, session])

  if (view === 'settings') {
    return <Card>{tr('settingsBody')}</Card>
  }
  if (view === 'history') {
    return <Card>{tr('historyBody')}</Card>
  }

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-navy">{tr('queue')}</h2>
      <PatientQueue patients={merged} query={query} onQuery={setQuery} />
    </div>
  )
}
