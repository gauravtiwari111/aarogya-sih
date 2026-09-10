import express from 'express'
import { getDoctorQueue, getDoctorPatientDetail, submitDoctorReview } from '../controllers/doctorController.js'

const router = express.Router()

router.get('/queue', getDoctorQueue)
router.get('/patient/:id', getDoctorPatientDetail)
router.post('/review', submitDoctorReview)

export default router
