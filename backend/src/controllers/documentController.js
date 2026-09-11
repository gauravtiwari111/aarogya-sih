import mongoose from 'mongoose'
import { Document } from '../models/Document.js'

const templates = {
  prescription: {
    kind: 'prescription',
    title: 'OPD Prescription — Cardiology',
    date: '12 Jan 2026',
    preview: 'Tab. Amlodipine 5mg OD, Tab. Atorvastatin 10mg HS',
    extracted: { Doctor: 'Dr. V. K. Mehta', Clinic: 'City Care Hospital' },
  },
  lab: {
    kind: 'lab',
    title: 'Lipid Profile & HbA1c Report',
    date: '06 Sep 2026',
    preview: 'Cholesterol 210 mg/dL, HbA1c 5.8%',
    extracted: { Lab: 'PathKind Labs', Status: 'Slightly elevated' },
  },
  discharge: {
    kind: 'discharge',
    title: 'Hospital Discharge Summary',
    date: '15 Nov 2025',
    preview: 'Admitted for Observation — Stable upon discharge',
    extracted: { Hospital: 'Metro Hospital', Diagnosis: 'Observation' },
  },
  upload: {
    kind: 'upload',
    title: 'Uploaded Document',
    date: '06 Sep 2026',
    preview: 'Scanned page — demo OCR extractions',
    extracted: { Type: 'Clinical note', Note: 'Previous OPD visit recorded' },
  },
}

function demoDoc(patientId, kind) {
  const template = templates[kind] || templates.upload
  return {
    id: `doc-${Date.now()}`,
    patientId,
    ...template,
  }
}

export async function uploadDocument(req, res, next) {
  try {
    const { patientId = 'PTH100125', kind = 'upload' } = req.body
    if (mongoose.connection.readyState !== 1) {
      return res.status(201).json(demoDoc(patientId, kind))
    }

    const template = templates[kind] || templates.upload
    const doc = await Document.create({
      patientId,
      kind: template.kind,
      title: template.title,
      date: template.date,
      preview: template.preview,
      extracted: template.extracted,
    })

    res.status(201).json(doc)
  } catch (error) {
    res.status(201).json(demoDoc(req.body.patientId, req.body.kind))
  }
}

export async function processDocumentOCR(req, res, next) {
  try {
    const { patientId = 'PTH100125', kind = 'upload' } = req.body
    if (mongoose.connection.readyState !== 1) {
      return res.json(demoDoc(patientId, kind))
    }

    const template = templates[kind] || templates.upload
    const doc = await Document.create({
      patientId,
      kind: template.kind,
      title: template.title,
      date: template.date,
      preview: template.preview,
      extracted: template.extracted,
    })

    res.json(doc)
  } catch (error) {
    res.json(demoDoc(req.body.patientId, req.body.kind))
  }
}

export async function getPatientDocuments(req, res, next) {
  try {
    const { patientId } = req.params
    if (mongoose.connection.readyState !== 1) {
      return res.json([])
    }
    const docs = await Document.find({ patientId }).sort({ createdAt: -1 })
    res.json(docs)
  } catch (error) {
    res.json([])
  }
}
