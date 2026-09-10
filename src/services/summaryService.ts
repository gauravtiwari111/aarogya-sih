import { DEMO_PATIENTS, PRIMARY_PATIENT_ID } from '../data/demoData'
import type { AISummary, ClinicalHistory, ConversationAnswer, DoctorReview } from '../types'
import { fetchJson } from './api'

function byId(id: string, answers: ConversationAnswer[]): string {
  return answers.find((a) => a.questionId === id)?.value ?? ''
}

export function historyFromAnswers(answers: ConversationAnswer[]): ClinicalHistory {
  const base = DEMO_PATIENTS.find((p) => p.id === PRIMARY_PATIENT_ID)!.history
  const complaint = byId('q1', answers) || base.chiefComplaint
  const duration = byId('q2', answers) || base.duration
  const location = byId('q3', answers) || base.hpiDetails.location
  const pattern = byId('q4', answers) || base.pattern
  const associated = byId('q5', answers) || base.associatedSymptoms
  const aggravating = byId('q6', answers) || base.hpiDetails.aggravating
  const relieving = byId('q7', answers) || base.hpiDetails.relieving
  const past = byId('q8', answers) || base.pastHistory
  const med = byId('q9', answers)
  const allergies = byId('q10', answers) || base.allergies
  const breathy = /breath/i.test(associated)

  return {
    ...base,
    chiefComplaint: complaint,
    duration,
    pattern,
    associatedSymptoms: associated,
    pastHistory: past,
    allergies,
    medications: med && med !== 'None reported'
      ? [{ name: med, dosage: '', frequency: '' }]
      : base.medications,
    hpi: `${pattern} ${location.toLowerCase()} ${complaint.toLowerCase()} with ${associated.toLowerCase()}.`.replace(/\s+/g, ' '),
    hpiDetails: {
      onset: duration,
      location,
      character: 'Pain/discomfort',
      duration: pattern,
      associated,
      aggravating,
      relieving,
    },
    attention: breathy
      ? { level: 'mild', message: 'Breathlessness reported with chest pain.' }
      : { level: 'none', message: '' },
  }
}

export async function generateClinicalSummary(
  patientId: string,
  answers: ConversationAnswer[],
): Promise<AISummary> {
  try {
    const res = await fetchJson<{ patientId: string; history: ClinicalHistory; disclaimer: string }>('/summary/generate', {
      method: 'POST',
      body: JSON.stringify({ patientId, answers }),
    })
    return res
  } catch (error) {
    console.warn('Backend summary generation failed, falling back locally:', error)
    return {
      patientId,
      history: historyFromAnswers(answers),
      disclaimer: 'AI-generated information — Doctor verification required',
    }
  }
}

export async function updateClinicalSummary(history: ClinicalHistory, patientId = PRIMARY_PATIENT_ID): Promise<ClinicalHistory> {
  try {
    return await fetchJson<ClinicalHistory>('/summary/update', {
      method: 'PUT',
      body: JSON.stringify({ patientId, history }),
    })
  } catch (error) {
    console.warn('Backend update clinical summary failed, returning local:', error)
    return history
  }
}

export async function confirmClinicalHistory(review: DoctorReview): Promise<DoctorReview> {
  try {
    return await fetchJson<DoctorReview>('/summary/confirm', {
      method: 'POST',
      body: JSON.stringify(review),
    })
  } catch (error) {
    console.warn('Backend confirm clinical history failed, returning local:', error)
    return { ...review, accepted: true, verifiedAt: '06 Sep 2026' }
  }
}

