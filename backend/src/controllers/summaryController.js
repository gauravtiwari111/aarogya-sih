import mongoose from 'mongoose'
import { evaluateClinicalAssessment } from '../services/aiService.js'
import { ClinicalRecord } from '../models/ClinicalRecord.js'

export async function generateClinicalSummary(req, res, next) {
  try {
    const { patientId = 'PTH100125', answers = [] } = req.body

    const { history, assessment } = await evaluateClinicalAssessment(answers)

    if (mongoose.connection.readyState === 1) {
      let record = await ClinicalRecord.findOne({ patientId })
      if (!record) {
        record = await ClinicalRecord.create({
          patientId,
          ...history,
          status: 'pending',
        })
      } else {
        Object.assign(record, history)
        await record.save()
      }
    }

    res.json({
      patientId,
      history,
      assessment,
      disclaimer: 'AI-generated preliminary intake information — Doctor verification required',
    })
  } catch (error) {
    const { history, assessment } = await evaluateClinicalAssessment(req.body.answers || [])
    res.json({
      patientId: req.body.patientId || 'PTH100125',
      history,
      assessment,
      disclaimer: 'AI-generated preliminary intake information — Doctor verification required',
    })
  }
}

export async function updateClinicalSummary(req, res, next) {
  try {
    const { patientId = 'PTH100125', history } = req.body

    if (mongoose.connection.readyState === 1) {
      let record = await ClinicalRecord.findOne({ patientId })
      if (record && history) {
        Object.assign(record, history)
        await record.save()
        return res.json(record)
      }
    }

    res.json(history)
  } catch (error) {
    res.json(req.body.history)
  }
}

export async function confirmClinicalHistory(req, res, next) {
  try {
    const { patientId = 'PTH100125', accepted = true, notes = '' } = req.body

    if (mongoose.connection.readyState === 1) {
      let record = await ClinicalRecord.findOne({ patientId })
      if (record) {
        record.doctorAccepted = accepted
        record.doctorNotes = notes
        record.status = 'reviewed'
        record.verifiedAt = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        await record.save()
        return res.json({
          patientId,
          accepted: record.doctorAccepted,
          notes: record.doctorNotes,
          history: record,
          verifiedAt: record.verifiedAt,
        })
      }
    }

    res.json({
      patientId,
      accepted,
      notes,
      verifiedAt: '06 Sep 2026',
    })
  } catch (error) {
    res.json({
      patientId: req.body.patientId || 'PTH100125',
      accepted: req.body.accepted ?? true,
      notes: req.body.notes || '',
      verifiedAt: '06 Sep 2026',
    })
  }
}

