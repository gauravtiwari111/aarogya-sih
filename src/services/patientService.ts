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

export function getDeletedPatientIds(): string[] {
  try {
    const raw = localStorage.getItem('aarogya_deleted_patient_ids')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveDeletedPatientId(id: string) {
  const existing = getDeletedPatientIds()
  if (!existing.includes(id)) {
    existing.push(id)
    localStorage.setItem('aarogya_deleted_patient_ids', JSON.stringify(existing))
  }
}

export function removePatient(id: string) {
  saveDeletedPatientId(id)

  const existing = getLocalSubmittedPatients()
  const filtered = existing.filter((p) => p.id !== id)
  localStorage.setItem('aarogya_submitted_patients', JSON.stringify(filtered))

  // Also remove from backend API if reachable
  fetchJson(`/patients/${id}`, { method: 'DELETE' }).catch((err) => {
    console.warn('Backend delete patient note:', err)
  })
}

export async function getPatients(): Promise<Patient[]> {
  const localList = getLocalSubmittedPatients()
  const deletedSet = new Set(getDeletedPatientIds())

  let rawList: Patient[] = []

  try {
    const apiPatients = await fetchJson<Patient[]>('/patients')
    if (Array.isArray(apiPatients) && apiPatients.length > 0) {
      const mergedMap = new Map<string, Patient>()
      localList.forEach((p) => mergedMap.set(p.id, p))
      apiPatients.forEach((p) => {
        if (!mergedMap.has(p.id)) {
          mergedMap.set(p.id, p)
        }
      })
      rawList = Array.from(mergedMap.values())
    }
  } catch (error) {
    console.warn('Backend API unavailable, using local & fallback patients list', error)
  }

  if (rawList.length === 0) {
    const mergedMap = new Map<string, Patient>()
    localList.forEach((p) => mergedMap.set(p.id, p))
    DEMO_PATIENTS.forEach((p) => {
      if (!mergedMap.has(p.id)) {
        mergedMap.set(p.id, p)
      }
    })
    rawList = Array.from(mergedMap.values())
  }

  return rawList.filter((p) => !deletedSet.has(p.id))
}

export async function getPatient(id: string): Promise<Patient | undefined> {
  const deletedSet = new Set(getDeletedPatientIds())
  if (deletedSet.has(id)) return undefined

  const localList = getLocalSubmittedPatients()
  const localFound = localList.find((p) => p.id === id)
  if (localFound) return localFound

  try {
    const apiFound = await fetchJson<Patient>(`/patients/${id}`)
    if (apiFound && !deletedSet.has(apiFound.id)) return apiFound
  } catch (error) {
    console.warn(`Backend API unavailable for patient ${id}, using fallback`, error)
  }

  const demoFound = DEMO_PATIENTS.find((p) => p.id === id)
  if (demoFound && !deletedSet.has(demoFound.id)) return demoFound

  return undefined
}

