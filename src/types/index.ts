export type Language = 'en' | 'hi'
export type FontSize = 'small' | 'medium' | 'large'
export type Gender = 'male' | 'female' | 'other'
export type AttentionLevel = 'none' | 'mild' | 'high'
export type DocumentKind = 'prescription' | 'lab' | 'upload' | 'discharge'
export type WorkflowStep =
  | 'welcome'
  | 'consent'
  | 'details'
  | 'conversation'
  | 'verification'
  | 'documents'
  | 'summary'
  | 'doctor'

export interface Medication {
  name: string
  dosage: string
  frequency: string
}

export interface Investigation {
  name: string
  value: string
  reference: string
  status: 'normal' | 'below' | 'above'
  date: string
}

export interface TimelineEvent {
  id: string
  date: string
  title: string
  subtitle: string
  kind: DocumentKind | 'complaint'
}

export interface DocumentRecord {
  id: string
  kind: DocumentKind
  title: string
  date: string
  preview: string
  extracted: Record<string, string>
}

export interface HpiDetails {
  onset: string
  location: string
  character: string
  duration: string
  associated: string
  aggravating: string
  relieving: string
}

export interface ClinicalHistory {
  chiefComplaint: string
  duration: string
  pattern: string
  associatedSymptoms: string
  hpi: string
  hpiDetails: HpiDetails
  pastHistory: string
  familyHistory: string
  personalHistory: string
  reviewOfSystems: string
  medications: Medication[]
  allergies: string
  investigations: Investigation[]
  attention: {
    level: AttentionLevel
    message: string
  }
}

export interface AISummary {
  patientId: string
  history: ClinicalHistory
  disclaimer: string
}

export interface ConversationMessage {
  id: string
  role: 'ai' | 'patient'
  text: string
  questionId?: string
}

export interface ConversationAnswer {
  questionId: string
  value: string
}

export interface Patient {
  id: string
  name: string
  age: number
  gender: Gender
  phone: string
  abhaId: string
  chiefComplaint: string
  duration: string
  attention: AttentionLevel
  attentionNote: string
  lastUpdated: string
  history: ClinicalHistory
  documents: DocumentRecord[]
  timeline: TimelineEvent[]
}

export interface PatientDraft {
  name: string
  age: string
  gender: Gender | ''
  phone: string
  abhaId: string
}

export interface DoctorReview {
  patientId: string
  accepted: boolean
  notes: string
  history: ClinicalHistory
  verifiedAt?: string
}

export interface AccessibilityPrefs {
  fontSize: FontSize
  highContrast: boolean
  reducedMotion: boolean
  readAloud: boolean
}

export interface TapOption {
  label: string
  labelHi: string
  value: string
}

export interface ConversationQuestion {
  id: string
  promptEn: string
  promptHi: string
  tapOptions: TapOption[]
  mapsTo: keyof Pick<
    ClinicalHistory,
    | 'chiefComplaint'
    | 'duration'
    | 'pattern'
    | 'associatedSymptoms'
    | 'pastHistory'
  > | 'location' | 'aggravating' | 'relieving' | 'medications' | 'allergies'
}
