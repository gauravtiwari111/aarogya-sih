import { QUESTIONS } from '../data/demoData'
import type { ConversationAnswer, ConversationQuestion } from '../types'
import { fetchJson } from './api'

export function getQuestions(): ConversationQuestion[] {
  return QUESTIONS
}

export async function submitConversation(answers: ConversationAnswer[], patientId = 'PTH100125'): Promise<ConversationAnswer[]> {
  try {
    await fetchJson('/conversations', {
      method: 'POST',
      body: JSON.stringify({ patientId, answers }),
    })
    return answers
  } catch (error) {
    console.warn('Backend API submit conversation failed, proceeding locally:', error)
    return answers
  }
}

