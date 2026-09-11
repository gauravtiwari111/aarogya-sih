import { DEMO_PATIENTS } from '../data/demoData'
import type { Patient } from '../types'
import { fetchJson } from './api'

export function getLocalSubmittedPatients(): Patient[] {
  try {
    const raw = localStorage.getItem('aarogya_submitted_patients')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveSubmittedPatient(patient: Patient) {
  const existing = getLocalSubmittedPatients()
  const filtered = existing.filter((p) => p.id !== patient.id)
  filtered.unshift(patient)
  localStorage.setItem('aarogya_submitted_patients', JSON.stringify(filtered))
}

export async function getPatients(): Promise<Patient[]> {
  const localList = getLocalSubmittedPatients()

  try {
    const apiPatients = await fetchJson<Patient[]>('/patients')
    if (Array.isArray(apiPatients) && apiPatients.length > 0) {
      // Merge local submitted patients at top, then API patients, avoiding duplicates
      const mergedMap = new Map<string, Patient>()
      localList.forEach((p) => mergedMap.set(p.id, p))
      apiPatients.forEach((p) => {
        if (!mergedMap.has(p.id)) {
          mergedMap.set(p.id, p)
        }
      })
      return Array.from(mergedMap.values())
    }
  } catch (error) {
    console.warn('Backend API unavailable, using local & fallback patients list', error)
  }

  // Fallback: local submitted patients at top, then DEMO_PATIENTS
  const mergedMap = new Map<string, Patient>()
  localList.forEach((p) => mergedMap.set(p.id, p))
  DEMO_PATIENTS.forEach((p) => {
    if (!mergedMap.has(p.id)) {
      mergedMap.set(p.id, p)
    }
  })
  return Array.from(mergedMap.values())
}

export async function getPatient(id: string): Promise<Patient | undefined> {
  const localList = getLocalSubmittedPatients()
  const localFound = localList.find((p) => p.id === id)
  if (localFound) return localFound

  try {
    const apiFound = await fetchJson<Patient>(`/patients/${id}`)
    if (apiFound) return apiFound
  } catch (error) {
    console.warn(`Backend API unavailable for patient ${id}, using fallback`, error)
  }

  return DEMO_PATIENTS.find((p) => p.id === id)
}
