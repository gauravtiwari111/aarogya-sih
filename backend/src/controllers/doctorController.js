import { PatientProfile } from '../models/PatientProfile.js'
import { ClinicalRecord } from '../models/ClinicalRecord.js'
import { Document } from '../models/Document.js'

export async function getDoctorQueue(req, res, next) {
  try {
    const profiles = await PatientProfile.find().lean()

    const queue = await Promise.all(
      profiles.map(async (p) => {
        const record = await ClinicalRecord.findOne({ patientId: p.patientId }).lean()
        return {
          id: p.patientId,
          name: p.name,
          age: p.age,
          gender: p.gender,
          phone: p.phone,
          abhaId: p.abhaId,
          chiefComplaint: record?.chiefComplaint || 'Chest discomfort on exertion',
          duration: record?.duration || '2 days',
          attention: record?.attention?.level || 'mild',
          attentionNote: record?.attention?.message || '',
          status: record?.status || 'pending',
          lastUpdated: '06 Sep 2026',
        }
      })
    )

    res.json(queue)
  } catch (error) {
    next(error)
  }
}

export async function getDoctorPatientDetail(req, res, next) {
  try {
    const { id } = req.params
    const profile = await PatientProfile.findOne({ patientId: id }).lean()
    const record = await ClinicalRecord.findOne({ patientId: id }).lean()
    const docs = await Document.find({ patientId: id }).lean()

    res.json({
      profile: profile || { patientId: id, name: 'Rahul Sharma', age: 46, gender: 'male' },
      record,
      documents: docs,
    })
  } catch (error) {
    next(error)
  }
}

export async function submitDoctorReview(req, res, next) {
  try {
    const { patientId, notes, accepted = true } = req.body

    let record = await ClinicalRecord.findOne({ patientId })
    if (record) {
      record.doctorNotes = notes
      record.doctorAccepted = accepted
      record.status = 'reviewed'
      record.verifiedAt = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      await record.save()
    }

    res.json({
      message: 'Review saved successfully',
      patientId,
      accepted,
      notes,
    })
  } catch (error) {
    next(error)
  }
}
