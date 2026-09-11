import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { Select } from '../components/Select'
import { PatientShell } from '../layouts/PatientLayout'
import { useApp } from '../hooks/AppContext'
import type { Gender } from '../types'

export function PatientDetailsPage() {
  const { tr, session, setSession, toast } = useApp()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const d = session.draft

  function update<K extends keyof typeof d>(key: K, value: (typeof d)[K]) {
    if (error) setError('')
    setSession({ draft: { ...d, [key]: value } })
  }

  async function submit() {
    const ageNum = Number(d.age)
    if (!d.name.trim() || !d.age.trim() || !d.gender || !d.phone.trim()) {
      setError(tr('required'))
      return
    }
    if (!Number.isFinite(ageNum) || ageNum < 1 || ageNum > 120) {
      setError('Please enter a valid age between 1 and 120.')
      return
    }
    if (!/^\d{10}$/.test(d.phone.replace(/\s+/g, ''))) {
      setError('Please enter a 10-digit phone number.')
      return
    }

    const currentId = session.selectedPatientId || `PTH${Math.floor(100000 + Math.random() * 900000)}`
    setSession({ selectedPatientId: currentId, step: 'conversation' })
    setSaving(true)

    try {
      const { fetchJson } = await import('../services/api')
      await fetchJson('/patients/profile', {
        method: 'PUT',
        body: JSON.stringify({
          patientId: currentId,
          name: d.name,
          age: ageNum,
          gender: d.gender,
          phone: d.phone.replace(/\s+/g, ''),
          abhaId: d.abhaId || `ABHA-${currentId.replace(/\D/g, '')}`,
        }),
      })
    } catch (e) {
      console.warn('Initial profile save note:', e)
    } finally {
      setSaving(false)
    }

    navigate('/conversation')
  }

  return (
    <PatientShell speakText={`${tr('patientDetails')}. ${tr('name')}, ${tr('age')}, ${tr('gender')}, ${tr('phone')}.`}>
      <Card className="mx-auto max-w-xl space-y-4">
        <h1 className="text-2xl font-bold">{tr('patientDetails')}</h1>
        <p className="text-sm text-muted">A few details help your doctor recognise this visit quickly.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input label={tr('name')} value={d.name} onChange={(e) => update('name', e.target.value)} autoComplete="name" />
          </div>
          <Input label={tr('age')} inputMode="numeric" value={d.age} onChange={(e) => update('age', e.target.value)} />
          <Select
            label={tr('gender')}
            value={d.gender}
            onChange={(e) => update('gender', e.target.value as Gender | '')}
            options={[
              { value: '', label: '—' },
              { value: 'male', label: tr('male') },
              { value: 'female', label: tr('female') },
              { value: 'other', label: tr('other') },
            ]}
          />
          <Input label={tr('phone')} inputMode="tel" value={d.phone} onChange={(e) => update('phone', e.target.value)} />
          <Input label={tr('enterAbha')} value={d.abhaId} onChange={(e) => update('abhaId', e.target.value)} placeholder="12-3456-7890-1234" />
        </div>
        <Button
          variant="outline"
          onClick={() => {
            update('abhaId', '12-3456-7890-1234')
            toast(tr('abhaMock'))
          }}
        >
          {tr('scanAbha')}
        </Button>
        <p className="text-sm text-muted">{tr('abhaMock')}</p>
        {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-red-700">{error}</p> : null}
        <Button className="w-full" onClick={() => void submit()} disabled={saving}>
          {saving ? tr('processing') : tr('continue')}
        </Button>
      </Card>
    </PatientShell>
  )
}
