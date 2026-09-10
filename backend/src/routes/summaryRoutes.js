import express from 'express'
import { generateClinicalSummary, updateClinicalSummary, confirmClinicalHistory } from '../controllers/summaryController.js'

const router = express.Router()

router.post('/generate', generateClinicalSummary)
router.put('/update', updateClinicalSummary)
router.post('/confirm', confirmClinicalHistory)

export default router
