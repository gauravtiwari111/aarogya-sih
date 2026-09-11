import express from 'express'
import { getPatients, getPatientById, updatePatientProfile, deletePatient } from '../controllers/patientController.js'

const router = express.Router()

router.get('/', getPatients)
router.get('/:id', getPatientById)
router.put('/profile', updatePatientProfile)
router.delete('/:id', deletePatient)

export default router
