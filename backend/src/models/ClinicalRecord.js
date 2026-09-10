import mongoose from 'mongoose'

const clinicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      index: true,
    },
    chiefComplaint: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '',
    },
    pattern: {
      type: String,
      default: '',
    },
    associatedSymptoms: {
      type: String,
      default: '',
    },
    hpi: {
      type: String,
      default: '',
    },
    hpiDetails: {
      onset: { type: String, default: '' },
      location: { type: String, default: '' },
      character: { type: String, default: '' },
      duration: { type: String, default: '' },
      associated: { type: String, default: '' },
      aggravating: { type: String, default: '' },
      relieving: { type: String, default: '' },
    },
    pastHistory: {
      type: String,
      default: 'No significant past medical history',
    },
    familyHistory: {
      type: String,
      default: 'No family history of chronic illness reported',
    },
    personalHistory: {
      type: String,
      default: 'Non-smoker, non-alcoholic',
    },
    reviewOfSystems: {
      type: String,
      default: 'Cardiovascular, respiratory, gastrointestinal within limits except chief complaint',
    },
    medications: [
      {
        name: String,
        dosage: String,
        frequency: String,
      },
    ],
    allergies: {
      type: String,
      default: 'No known drug allergies (NKDA)',
    },
    investigations: [
      {
        name: String,
        value: String,
        reference: String,
        status: { type: String, enum: ['normal', 'below', 'above'], default: 'normal' },
        date: String,
      },
    ],
    attention: {
      level: {
        type: String,
        enum: ['none', 'mild', 'high'],
        default: 'none',
      },
      message: {
        type: String,
        default: '',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'completed'],
      default: 'pending',
    },
    doctorNotes: {
      type: String,
      default: '',
    },
    doctorAccepted: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

export const ClinicalRecord = mongoose.model('ClinicalRecord', clinicalRecordSchema)
