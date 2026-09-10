import express from 'express'
import { uploadDocument, processDocumentOCR, getPatientDocuments } from '../controllers/documentController.js'

const router = express.Router()

router.post('/upload', uploadDocument)
router.post('/ocr', processDocumentOCR)
router.get('/:patientId', getPatientDocuments)

export default router
