import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { PageTransition } from '../components/PageTransition'
import { useApp } from '../hooks/AppContext'

export function SuccessPage() {
  const navigate = useNavigate()
  const { tr, session, resetSession } = useApp()
  const name = session.draft.name || 'Rahul Sharma'
  return (
    <PageTransition className="relative flex min-h-svh items-center justify-center overflow-hidden px-4">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="float-blob absolute top-10 left-10 h-32 w-32 rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="float-blob absolute right-8 bottom-16 h-40 w-40 rounded-full bg-teal-200/40 blur-3xl" style={{ animationDelay: '1s' }} />
      </div>
      <Card className="relative w-full max-w-lg text-center">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 16 }}>
          <CheckCircle2 className="mx-auto text-emerald-600" size={64} />
        </motion.div>
        <h1 className="mt-4 text-2xl font-bold text-navy">✓ {tr('saved')}</h1>
        <p className="mt-2 text-sm text-muted">{tr('savedSub')}</p>
        <dl className="mt-6 space-y-2 rounded-2xl border border-line bg-slate-50 p-4 text-left">
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
    </PageTransition>
  )
}
