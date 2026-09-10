import { DEMO_PATIENTS } from '../data/demoData'
import type { Patient } from '../types'
import { fetchJson } from './api'

export async function getPatients(): Promise<Patient[]> {
  try {
    return await fetchJson<Patient[]>('/patients')
  } catch (error) {
    console.warn('Backend API unavailable, using demo patients fallback', error)
    return DEMO_PATIENTS
  }
}

export async function getPatient(id: string): Promise<Patient | undefined> {
  try {
    return await fetchJson<Patient>(`/patients/${id}`)
  } catch (error) {
    console.warn(`Backend API unavailable for patient ${id}, using demo patient fallback`, error)
    return DEMO_PATIENTS.find((p) => p.id === id)
  }
}

