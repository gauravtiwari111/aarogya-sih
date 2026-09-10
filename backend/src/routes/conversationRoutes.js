import express from 'express'
import { getQuestions, submitConversation, getConversation } from '../controllers/conversationController.js'

const router = express.Router()

router.get('/questions', getQuestions)
router.post('/', submitConversation)
router.get('/:patientId', getConversation)

export default router
