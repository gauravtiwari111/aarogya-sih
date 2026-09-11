import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card } from '../components/Card'
import { DocumentCard } from '../components/DocumentCard'
import { Modal } from '../components/Modal'
import { SectionCard } from '../components/SectionCard'
import { StatusBadge } from '../components/StatusBadge'
import { SummaryCard } from '../components/SummaryCard'
import { Timeline } from '../components/Timeline'
import { DEMO_PATIENTS, PRIMARY_PATIENT_ID } from '../data/demoData'
import { useApp } from '../hooks/AppContext'
import { getPatient } from '../services/patientService'
import type { DocumentRecord, Patient } from '../types'

export function DoctorPatientPage() {
  const { id = '' } = useParams()
  const { tr, session, setSession } = useApp()
  const [patient, setPatient] = useState<Patient | undefined>()
  const [doc, setDoc] = useState<DocumentRecord | null>(null)

  useEffect(() => {
    void getPatient(id).then((found) => {
      const base = found ?? DEMO_PATIENTS.find((p) => p.id === id)
      if (!base) {
        setPatient(undefined)
        return
      }
      if ((id === session.selectedPatientId || id === PRIMARY_PATIENT_ID) && session.history) {
        setPatient({
          ...base,
          name: session.draft.name || base.name,
          age: Number(session.draft.age) || base.age,
          gender: session.draft.gender || base.gender,
          history: session.history,
          documents: session.documents.length ? session.documents : base.documents,
          timeline: session.timeline.length ? session.timeline : base.timeline,
          attention: session.history.attention.level,
          attentionNote: session.history.attention.message,
          chiefComplaint: session.history.chiefComplaint,
          duration: session.history.duration,
        })
      } else {
        setPatient(base)
      }
    })
  }, [id, session])

  if (!patient) {
    return <Card>{tr('noPatients')}</Card>
  }

  const h = patient.history

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-navy">{patient.name}</h2>
          <p className="text-muted">
            {patient.age} • {patient.gender === 'male' ? 'Male' : patient.gender === 'female' ? 'Female' : 'Other'} • {patient.id}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to permanently delete patient ${patient.name} (${patient.id})?`)) {
                import('../services/patientService').then(({ removePatient }) => {
                  removePatient(patient.id)
                  window.location.href = '/doctor'
                })
              }
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 font-semibold text-red-700 transition hover:bg-red-100"
          >
            Delete Patient
          </button>
          <Link
            to="/doctor/review"
            className="inline-flex min-h-11 items-center rounded-2xl bg-primary px-5 font-semibold text-white transition hover:bg-primary-dark"
            onClick={() => setSession({ selectedPatientId: patient.id })}
          >
            {tr('review')}
          </Link>
        </div>
      </div>
      <StatusBadge level={patient.attention} label={patient.attentionNote} />
      <div className="grid gap-3 md:grid-cols-2">
        <SummaryCard title={tr('chiefComplaint')}>
          {h.chiefComplaint} × {h.duration}
        </SummaryCard>
        <SummaryCard title={tr('hpi')}>{h.hpi}</SummaryCard>
        <SummaryCard title={tr('pastHistory')}>{h.pastHistory}</SummaryCard>
        <SummaryCard title={tr('medication')}>{h.medications.map((m) => m.name).join(', ') || '—'}</SummaryCard>
        <SummaryCard title={tr('allergies')}>{h.allergies}</SummaryCard>
        <SummaryCard title={tr('investigations')}>
          {h.investigations.length ? 'Blood report available' : '—'}
        </SummaryCard>
      </div>
      <SectionCard title={tr('hpi')} defaultOpen>
        <dl className="grid gap-2 sm:grid-cols-2">
          <Row k={tr('onset')} v={h.hpiDetails.onset} />
          <Row k={tr('location')} v={h.hpiDetails.location} />
          <Row k={tr('character')} v={h.hpiDetails.character} />
          <Row k={tr('duration')} v={h.hpiDetails.duration} />
          <Row k={tr('associated')} v={h.hpiDetails.associated} />
          <Row k={tr('aggravating')} v={h.hpiDetails.aggravating} />
          <Row k={tr('relieving')} v={h.hpiDetails.relieving} />
        </dl>
      </SectionCard>
      <SectionCard title={tr('pastHistory')}>{h.pastHistory}</SectionCard>
      <SectionCard title={tr('medication')}>
        {h.medications.map((m) => (
          <p key={m.name}>{m.name}</p>
        ))}
      </SectionCard>
      <SectionCard title={tr('allergies')}>{h.allergies}</SectionCard>
      <SectionCard title={tr('familyHistory')}>{h.familyHistory}</SectionCard>
      <SectionCard title={tr('personalHistory')}>{h.personalHistory}</SectionCard>
      <SectionCard title={tr('ros')}>{h.reviewOfSystems}</SectionCard>
      <SectionCard title={tr('investigations')}>
        {h.investigations.map((inv) => (
          <p key={inv.name}>
            {inv.date}: {inv.name} {inv.value} (ref {inv.reference})
          </p>
        ))}
      </SectionCard>
      <SectionCard title={tr('documents')} defaultOpen>
        {patient.documents.length === 0 ? (
          tr('noDocs')
        ) : (
          <div className="flex flex-wrap gap-3">
            {patient.documents.map((d) => (
              <DocumentCard key={d.id} doc={d} actionLabel={tr('viewReport')} onOpen={() => setDoc(d)} />
            ))}
          </div>
        )}
      </SectionCard>
      <SectionCard title={tr('timeline')}>
        <Timeline events={patient.timeline} />
      </SectionCard>
      <Modal open={Boolean(doc)} title={doc?.title ?? ''} onClose={() => setDoc(null)}>
        <pre className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm">{doc?.preview}</pre>
        {doc
          ? Object.entries(doc.extracted).map(([k, v]) => (
              <p key={k}>
                <strong>{k}:</strong> {v}
              </p>
            ))
          : null}
      </Modal>
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-sm text-muted">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  )
}
