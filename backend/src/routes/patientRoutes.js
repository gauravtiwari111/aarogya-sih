import express from 'express'
import { getPatients, getPatientById, updatePatientProfile } from '../controllers/patientController.js'

const router = express.Router()

router.get('/', getPatients)
router.get('/:id', getPatientById)
router.put('/profile', updatePatientProfile)

export default router
