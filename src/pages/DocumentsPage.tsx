import { useState } from 'react'
import { Camera, FileUp, FlaskConical } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { DocumentCard } from '../components/DocumentCard'
import { Modal } from '../components/Modal'
import { Timeline } from '../components/Timeline'
import { PatientShell } from '../layouts/PatientLayout'
import { useApp } from '../hooks/AppContext'
import { extractDocumentData, timelineFrom } from '../services/documentService'
import type { DocumentKind } from '../types'

const stages = ['analyzing', 'extracting', 'organizing'] as const

export function DocumentsPage() {
  const { tr, session, setSession, toast } = useApp()
  const navigate = useNavigate()
  const [stage, setStage] = useState<(typeof stages)[number] | null>(null)
  const [error, setError] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  async function add(kind: DocumentKind) {
    setError(false)
    setStage('analyzing')
    await waitStages()
    try {
      const doc = await extractDocumentData(kind)
      const documents = [...session.documents.filter((d) => d.kind !== kind), doc]
      const complaint = session.history?.chiefComplaint || session.answers.find((a) => a.questionId === 'q1')?.value || 'Chest pain'
      const timeline = timelineFrom(documents, complaint)
      setSession({ documents, timeline })
      toast(tr('docAdded'))
      setPreview(doc.id)
    } catch {
      setError(true)
    } finally {
      setStage(null)
    }
  }

  async function waitStages() {
    setStage('analyzing')
    await sleep(500)
    setStage('extracting')
    await sleep(500)
    setStage('organizing')
    await sleep(400)
  }

  const docs = session.documents
  const open = docs.find((d) => d.id === preview)

  return (
    <PatientShell>
      <div className="mx-auto max-w-2xl space-y-5">
        <h1 className="text-2xl font-bold">{tr('addDocs')}</h1>
        <p className="text-muted">{tr('addDocsSub')}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Button variant="outline" onClick={() => void add('prescription')}>
            <Camera size={18} /> {tr('scanRx')}
          </Button>
          <Button variant="outline" onClick={() => void add('lab')}>
            <FlaskConical size={18} /> {tr('scanLab')}
          </Button>
          <Button variant="outline" onClick={() => void add('upload')}>
            <FileUp size={18} /> {tr('uploadDoc')}
          </Button>
        </div>
        {stage ? (
          <Card>
            <p className="font-medium">{tr(stage)}</p>
            <p className="text-sm text-muted">{tr('demoOcr')}</p>
          </Card>
        ) : null}
        {error ? <p className="text-red-700">{tr('ocrFail')}</p> : null}
        {docs.length === 0 && !stage ? <Card className="text-muted">{tr('noDocs')}</Card> : null}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {docs.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} actionLabel={tr('viewReport')} onOpen={() => setPreview(doc.id)} />
          ))}
        </div>
        {docs.length > 0 ? (
          <div>
            <p className="mb-2 text-sm text-amber-800">{tr('ocrLabel')}</p>
            <h2 className="mb-3 text-xl font-semibold">{tr('timeline')}</h2>
            <Timeline events={session.timeline} />
          </div>
        ) : null}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              setSession({ step: 'summary' })
              navigate('/summary')
            }}
          >
            {tr('skip')}
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              setSession({ step: 'summary' })
              navigate('/summary')
            }}
          >
            {tr('continue')}
          </Button>
        </div>
      </div>
      <Modal open={Boolean(open)} title={open?.title ?? ''} onClose={() => setPreview(null)}>
        {open ? (
          <div className="space-y-2">
            <p className="text-sm text-amber-800">{tr('demoOcr')}</p>
            {Object.entries(open.extracted).map(([k, v]) => (
              <p key={k}>
                <strong>{k}:</strong> {v}
              </p>
            ))}
          </div>
        ) : null}
      </Modal>
    </PatientShell>
  )
}

function sleep(ms: number) {
  return new Promise((r) => window.setTimeout(r, ms))
}
