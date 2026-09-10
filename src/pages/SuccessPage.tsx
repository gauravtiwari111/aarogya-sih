import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { useApp } from '../hooks/AppContext'

export function SuccessPage() {
  const navigate = useNavigate()
  const { tr, session, resetSession } = useApp()
  const name = session.draft.name || 'Rahul Sharma'
  return (
    <div className="flex min-h-svh items-center justify-center bg-page px-4">
      <Card className="w-full max-w-lg text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <CheckCircle2 className="mx-auto text-emerald-600" size={64} />
        </motion.div>
        <h1 className="mt-4 text-2xl font-bold text-navy">✓ {tr('saved')}</h1>
        <dl className="mt-6 space-y-2 text-left bg-slate-50 p-4 rounded-2xl border border-line">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Patient Name</dt>
            <dd className="font-semibold text-navy">{name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Reference ID</dt>
            <dd className="font-mono font-bold text-primary">{session.selectedPatientId || 'PTH100125'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Status</dt>
            <dd className="font-semibold text-emerald-600">✓ Sent to Doctor Queue</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-muted">
          🔒 Your details are locked & submitted. Only an authorized doctor can view and review your report using Doctor credentials.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button
            className="w-full py-3"
            onClick={() => {
              resetSession()
              navigate('/')
            }}
          >
            Done — Back to Home
          </Button>
        </div>
      </Card>
    </div>
  )
}
