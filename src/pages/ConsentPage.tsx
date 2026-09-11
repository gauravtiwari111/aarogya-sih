import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { Modal } from '../components/Modal'
import { PatientShell } from '../layouts/PatientLayout'
import { useApp } from '../hooks/AppContext'

export function ConsentPage() {
  const { tr, setSession } = useApp()
  const navigate = useNavigate()
  const [help, setHelp] = useState(false)

  return (
    <PatientShell speakText={`${tr('beforeBegin')}. ${tr('consentBody')}`}>
      <Card className="mx-auto max-w-xl overflow-hidden">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-3 inline-flex rounded-2xl bg-primary-light p-3 text-primary">
          <Shield />
        </motion.div>
        <h1 className="text-2xl font-bold text-navy">{tr('beforeBegin')}</h1>
        <p className="mt-3 leading-relaxed text-muted">{tr('consentBody')}</p>
        <ul className="mt-4 space-y-2 text-sm text-navy">
          {['Used only for this visit', 'Shared with your assigned doctor', 'You can skip any question'].map((item) => (
            <li key={item} className="flex items-start gap-2 rounded-xl bg-primary-light/60 px-3 py-2">
              <span className="mt-0.5 text-primary">✓</span>
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-muted">{tr('privacy')}</p>
        <div className="mt-5">
          <LanguageSwitcher />
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <Button
            onClick={() => {
              setSession({ consent: true, step: 'details' })
              navigate('/patient-details')
            }}
          >
            ✓ {tr('agree')}
          </Button>
          <Button variant="outline" onClick={() => setHelp(true)}>
            {tr('needHelp')}
          </Button>
        </div>
      </Card>
      <Modal open={help} title={tr('helpTitle')} onClose={() => setHelp(false)}>
        <p className="leading-relaxed text-muted">{tr('helpBody')}</p>
        <Button className="mt-4" onClick={() => setHelp(false)}>
          {tr('close')}
        </Button>
      </Modal>
    </PatientShell>
  )
}
