import mongoose from 'mongoose'
import { PatientProfile } from '../models/PatientProfile.js'
import { ClinicalRecord } from '../models/ClinicalRecord.js'
import { Document } from '../models/Document.js'

// Pre-seeded SIH Demo Patients
const DELETED_DEMO_IDS = new Set()

const DEFAULT_DEMO_PATIENTS = [
  {
    id: 'PTH100125',
    name: 'Rahul Sharma',
    age: 46,
    gender: 'male',
    phone: '9876543210',
    abhaId: 'ABHA-9821-4410-1209',
    chiefComplaint: 'Chest discomfort on exertion',
    duration: '2 days',
    attention: 'mild',
    attentionNote: 'Exertional chest discomfort with hypertension history',
    lastUpdated: '06 Sep 2026',
    history: {
      chiefComplaint: 'Chest discomfort on exertion',
      duration: '2 days',
      pattern: 'Intermittent, worse with walking',
      associatedSymptoms: 'Shortness of breath, mild sweating',
      hpi: 'Patient reports 2-day history of pressure-like chest discomfort occurring primarily during physical exertion.',
      hpiDetails: {
        onset: '2 days ago',
        location: 'Substernal chest',
        character: 'Pressure-like',
        duration: '10–15 mins per episode',
        associated: 'Shortness of breath, mild diaphoresis',
        aggravating: 'Walking briskly, climbing stairs',
        relieving: 'Rest',
      },
      pastHistory: 'Hypertension (3 years), Dyslipidemia (1 year)',
      familyHistory: 'Father had MI at age 58',
      personalHistory: 'Non-smoker, occasional alcohol, sedentary desk job',
      reviewOfSystems: 'Negative for syncope, palpitations, or orthopnea',
      medications: [
        { name: 'Amlodipine', dosage: '5 mg', frequency: 'Once daily' },
        { name: 'Atorvastatin', dosage: '10 mg', frequency: 'At bedtime' },
      ],
      allergies: 'No known drug allergies (NKDA)',
      investigations: [
        { name: 'Blood Pressure', value: '138/88 mmHg', reference: '< 120/80', status: 'above', date: '06 Sep 2026' },
        { name: 'HbA1c', value: '5.8%', reference: '< 5.7%', status: 'above', date: '06 Sep 2026' },
        { name: 'Total Cholesterol', value: '210 mg/dL', reference: '< 200', status: 'above', date: '06 Sep 2026' },
      ],
      attention: {
        level: 'mild',
        message: 'Exertional chest pain with cardiac risk factors — evaluate for stable angina.',
      },
    },
    documents: [
      {
        id: 'doc-101',
        kind: 'prescription',
        title: 'OPD Prescription — Cardiology',
        date: '12 Jan 2026',
        preview: 'Tab. Amlodipine 5mg OD, Tab. Atorvastatin 10mg HS',
        extracted: { Doctor: 'Dr. V. K. Mehta', Clinic: 'City Care Hospital' },
      },
      {
        id: 'doc-102',
        kind: 'lab',
        title: 'Lipid Profile & HbA1c Report',
        date: '06 Sep 2026',
        preview: 'Cholesterol 210 mg/dL, HbA1c 5.8%',
        extracted: { Lab: 'PathKind Labs', Status: 'Slightly elevated' },
      },
    ],
    timeline: [
      { id: 'tl-1', date: '12 Jan 2026', title: 'Cardiology OPD Visit', subtitle: 'Prescription issued', kind: 'prescription' },
      { id: 'tl-2', date: '06 Sep 2026', title: 'Lab Test Recorded', subtitle: 'Lipid profile & HbA1c', kind: 'lab' },
      { id: 'tl-3', date: '06 Sep 2026', title: 'Current Intake', subtitle: 'Chest discomfort on exertion', kind: 'complaint' },
    ],
  },
  {
    id: 'PTH100126',
    name: 'Priya Verma',
    age: 32,
    gender: 'female',
    phone: '9811223344',
    abhaId: 'ABHA-3312-9081-7744',
    chiefComplaint: 'Dry cough and fever',
    duration: '4 days',
    attention: 'none',
    attentionNote: '',
    lastUpdated: '05 Sep 2026',
    history: {
      chiefComplaint: 'Dry cough and fever',
      duration: '4 days',
      pattern: 'Continuous, low-grade fever',
      associatedSymptoms: 'Body ache, mild sore throat',
      hpi: 'Patient presents with 4-day history of dry throat tickle progressing to cough and fever up to 100.4°F.',
      hpiDetails: {
        onset: '4 days ago',
        location: 'Throat & upper airways',
        character: 'Dry, tickling',
        duration: 'Continuous',
        associated: 'Low grade fever, fatigue',
        aggravating: 'Cold water, night time',
        relieving: 'Warm water gargles',
      },
      pastHistory: 'Mild bronchial asthma in childhood (resolved)',
      familyHistory: 'No relevant medical history',
      personalHistory: 'Non-smoker, vegetarian',
      reviewOfSystems: 'No shortness of breath, no chest pain',
      medications: [{ name: 'Paracetamol', dosage: '650 mg', frequency: 'PRN for fever' }],
      allergies: 'No known drug allergies',
      investigations: [],
      attention: { level: 'none', message: '' },
    },
    documents: [],
    timeline: [{ id: 'tl-p2-1', date: '05 Sep 2026', title: 'Current Intake', subtitle: 'Dry cough and fever', kind: 'complaint' }],
  },
]

export async function getPatients(req, res, next) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(DEFAULT_DEMO_PATIENTS.filter((p) => !DELETED_DEMO_IDS.has(p.id)))
    }

    const dbProfiles = await PatientProfile.find().lean()
    if (dbProfiles.length === 0) {
      return res.json(DEFAULT_DEMO_PATIENTS.filter((p) => !DELETED_DEMO_IDS.has(p.id)))
    }

    const patients = await Promise.all(
      dbProfiles.map(async (p) => {
        const record = await ClinicalRecord.findOne({ patientId: p.patientId }).lean()
        const docs = await Document.find({ patientId: p.patientId }).lean()

        return {
          id: p.patientId,
          name: p.name,
          age: p.age,
          gender: p.gender,
          phone: p.phone,
          abhaId: p.abhaId,
          chiefComplaint: record?.chiefComplaint || 'General checkup',
          duration: record?.duration || '1 day',
          attention: record?.attention?.level || 'none',
          attentionNote: record?.attention?.message || '',
          lastUpdated: '06 Sep 2026',
          history: record || DEFAULT_DEMO_PATIENTS[0].history,
          documents: docs.length ? docs : DEFAULT_DEMO_PATIENTS[0].documents,
          timeline: DEFAULT_DEMO_PATIENTS[0].timeline,
        }
      })
    )

    res.json(patients.filter((p) => !DELETED_DEMO_IDS.has(p.id)))
  } catch (error) {
    res.json(DEFAULT_DEMO_PATIENTS.filter((p) => !DELETED_DEMO_IDS.has(p.id)))
  }
}

export async function getPatientById(req, res, next) {
  try {
    const { id } = req.params
    if (DELETED_DEMO_IDS.has(id)) {
      return res.status(404).json({ message: 'Patient not found' })
    }

    if (mongoose.connection.readyState !== 1) {
      const demo = DEFAULT_DEMO_PATIENTS.find((p) => p.id === id && !DELETED_DEMO_IDS.has(p.id))
      if (!demo) return res.status(404).json({ message: 'Patient not found' })
      return res.json(demo)
    }

    const profile = await PatientProfile.findOne({ patientId: id }).lean()

    if (!profile) {
      const demo = DEFAULT_DEMO_PATIENTS.find((p) => p.id === id && !DELETED_DEMO_IDS.has(p.id))
      if (!demo) return res.status(404).json({ message: 'Patient not found' })
      return res.json(demo)
    }

    const record = await ClinicalRecord.findOne({ patientId: id }).lean()
    const docs = await Document.find({ patientId: id }).lean()

    res.json({
      id: profile.patientId,
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      phone: profile.phone,
      abhaId: profile.abhaId,
      chiefComplaint: record?.chiefComplaint || 'Chest discomfort on exertion',
      duration: record?.duration || '2 days',
      attention: record?.attention?.level || 'mild',
      attentionNote: record?.attention?.message || '',
      lastUpdated: '06 Sep 2026',
      history: record || DEFAULT_DEMO_PATIENTS[0].history,
      documents: docs.length ? docs : DEFAULT_DEMO_PATIENTS[0].documents,
      timeline: DEFAULT_DEMO_PATIENTS[0].timeline,
    })
  } catch (error) {
    const demo = DEFAULT_DEMO_PATIENTS.find((p) => p.id === req.params.id && !DELETED_DEMO_IDS.has(p.id))
    if (!demo) return res.status(404).json({ message: 'Patient not found' })
    res.json(demo)
  }
}

export async function updatePatientProfile(req, res, next) {
  try {
    const { name, age, gender, phone, abhaId, history } = req.body
    const patientId = req.body.patientId || 'PTH100125'

    if (mongoose.connection.readyState !== 1) {
      return res.json({ patientId, name, age, gender, phone, abhaId })
    }

    let profile = await PatientProfile.findOne({ patientId })

    if (!profile) {
      profile = await PatientProfile.create({
        patientId,
        name: name || 'Rahul Sharma',
        age: Number(age) || 46,
        gender: gender || 'male',
        phone: phone || '9876543210',
        abhaId: abhaId || 'ABHA-9821-4410-1209',
      })
    } else {
      if (name) profile.name = name
      if (age) profile.age = Number(age)
      if (gender) profile.gender = gender
      if (phone) profile.phone = phone
      if (abhaId) profile.abhaId = abhaId
      await profile.save()
    }

    if (history) {
      let record = await ClinicalRecord.findOne({ patientId })
      if (!record) {
        await ClinicalRecord.create({
          patientId,
          ...history,
          status: 'pending',
        })
      } else {
        Object.assign(record, history)
        await record.save()
      }
    }

    res.json(profile)
  } catch (error) {
    console.error('Error updating patient profile/record:', error)
    res.json({ patientId: req.body.patientId || 'PTH100125', ...req.body })
  }
}

export async function deletePatient(req, res, next) {
  try {
    const { id } = req.params
    DELETED_DEMO_IDS.add(id)
    if (mongoose.connection.readyState === 1) {
      await PatientProfile.deleteOne({ patientId: id })
      await ClinicalRecord.deleteOne({ patientId: id })
      await Document.deleteMany({ patientId: id })
    }
    res.json({ success: true, message: `Patient ${id} deleted successfully` })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting patient' })
  }
}


