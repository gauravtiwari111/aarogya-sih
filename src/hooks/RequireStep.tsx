import type { ReactNode } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useApp } from '../hooks/AppContext'
import type { WorkflowStep } from '../types'

const order: WorkflowStep[] = [
  'welcome',
  'consent',
  'details',
  'conversation',
  'verification',
  'documents',
  'summary',
  'doctor',
]

export function RequireStep({ step, children }: { step: WorkflowStep; children: ReactNode }) {
  const { session, resetSession } = useApp()
  const need = order.indexOf(step)
  const have = order.indexOf(session.step)

  // Block duplicate submissions on the same Patient ID
  if (session.submitted) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-page px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-lg border border-line">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-2xl font-bold">
            🔒
          </div>
          <h2 className="text-xl font-bold text-navy">Intake Already Submitted</h2>
          <p className="mt-2 text-sm text-muted">
            Health intake for Patient ID <span className="font-mono font-bold text-primary">{session.selectedPatientId}</span> has already been submitted to the doctor queue.
          </p>
          <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs font-medium text-slate-700">
            ✓ Status: Awaiting Physician Verification
          </div>
          <p className="mt-3 text-xs text-muted">Re-filling duplicate data on the same Patient ID is disabled.</p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={() => resetSession()}
              className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              + Start New Patient Intake (New ID)
            </button>
            <Link to="/" className="block pt-1 text-xs font-medium text-muted hover:underline">
              ← Return to Home Page
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (need >= order.indexOf('details') && !session.consent && session.step === 'welcome') {
    return <Navigate to="/consent" replace />
  }
  if (need >= order.indexOf('conversation') && !session.draft.name && have < order.indexOf('conversation')) {
    return <Navigate to="/patient-details" replace />
  }
  if (have < need - 1) {
    const target = session.step === 'welcome' ? '/' : `/${session.step === 'details' ? 'patient-details' : session.step}`
    if (session.step === 'welcome') return <Navigate to="/" replace />
    if (session.step === 'details') return <Navigate to="/patient-details" replace />
    return <Navigate to={target} replace />
  }
  return children
}
