import { DEMO_PATIENTS, PRIMARY_PATIENT_ID } from '../data/demoData'
import type { AISummary, ClinicalHistory, ConversationAnswer, DoctorReview } from '../types'
import { fetchJson } from './api'

function byId(id: string, answers: ConversationAnswer[]): string {
  return answers.find((a) => a.questionId === id)?.value ?? ''
}

export function historyFromAnswers(answers: ConversationAnswer[]): ClinicalHistory {
  const base = DEMO_PATIENTS.find((p) => p.id === PRIMARY_PATIENT_ID)!.history
  
  const rawComplaint = byId('q1', answers) || answers[0]?.value || ''
  const complaint = rawComplaint.trim() !== '' ? rawComplaint.trim() : 'General Medical Consultation'

  const rawDuration = byId('q2', answers) || answers[1]?.value || ''
  const duration = rawDuration.trim() !== '' ? rawDuration.trim() : '1 day'

  const location = byId('q3', answers) || 'General'
  const pattern = byId('q4', answers) || 'Intermittent'
  const associated = byId('q5', answers) || 'None reported'
  const aggravating = byId('q6', answers) || 'None reported'
  const relieving = byId('q7', answers) || 'Rest'
  const past = byId('q8', answers) || 'No past history reported'
  const med = byId('q9', answers)
  const allergies = byId('q10', answers) || 'No known drug allergies (NKDA)'

  // Dynamic Rule Assessment based on actual text
  const fullText = `${complaint} ${associated} ${location}`.toLowerCase()
  const isBreathless = /breath|dyspnea|gasping/i.test(fullText)
  const isChestPain = /chest|substernal|angina|heart/i.test(fullText)
  const isHighFever = /fever|temperature|chills/i.test(fullText)
  const isSevereCombined = isBreathless && isChestPain

  let level: 'none' | 'mild' | 'high' = isSevereCombined
    ? 'high'
    : isChestPain || isBreathless
    ? 'mild'
    : isHighFever
    ? 'mild'
    : 'none'

  let message = isSevereCombined
    ? 'High Priority: Combined chest pain and shortness of breath reported.'
    : isChestPain
    ? 'Attention Required: Localized chest pain reported.'
    : isBreathless
    ? 'Attention Required: Shortness of breath reported.'
    : isHighFever
    ? 'Mild Concern: High fever reported.'
    : ''

  return {
    ...base,
    chiefComplaint: complaint,
    duration,
    pattern,
    associatedSymptoms: associated,
    pastHistory: past,
    allergies,
    medications: med && med !== 'None reported' && med !== 'None'
      ? [{ name: med, dosage: 'Standard', frequency: 'As prescribed' }]
      : [],
    hpi: `Patient presents with ${complaint.toLowerCase()} over ${duration}. Associated symptoms: ${associated.toLowerCase()}.`.replace(/\s+/g, ' '),
    hpiDetails: {
      onset: duration,
      location,
      character: 'Symptom discomfort',
      duration: pattern,
      associated,
      aggravating,
      relieving,
    },
    attention: { level, message },
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
