import { Link } from 'react-router-dom'
import { StatusBadge } from './StatusBadge'
import type { Patient } from '../types'
import { Card } from './Card'
import { useApp } from '../hooks/AppContext'

export function PatientQueue({
  patients,
  query,
  onQuery,
}: {
  patients: Patient[]
  query: string
  onQuery: (value: string) => void
}) {
  const { tr } = useApp()
  const filtered = patients.filter((p) => {
    const q = query.toLowerCase()
    return p.name.toLowerCase().includes(q) || p.chiefComplaint.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
  })

  return (
    <div>
      <label className="mb-4 block">
        <span className="sr-only">{tr('searchPatients')}</span>
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={tr('searchPatients')}
          className="w-full rounded-2xl border border-line bg-white px-4 py-3"
        />
      </label>
      {filtered.length === 0 ? (
        <Card className="text-muted">{tr('noPatients')}</Card>
      ) : (
        <ul className="space-y-3">
          {filtered.map((p) => (
            <li key={p.id}>
              <Card className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-navy">{p.name}</p>
                  <p className="text-sm text-muted">
                    {p.age} {p.gender === 'male' ? 'M' : p.gender === 'female' ? 'F' : 'O'} · {p.id}
                  </p>
                  <p>
                    {p.chiefComplaint} · {p.duration}
                  </p>
                  <div className="mt-2">
                    <StatusBadge level={p.attention} label={p.attentionNote} />
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {tr('lastUpdated')}: {p.lastUpdated}
                  </p>
                </div>
                <Link
                  to={`/doctor/patient/${p.id}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-primary px-5 font-semibold text-white"
                >
                  {tr('viewPatient')}
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
