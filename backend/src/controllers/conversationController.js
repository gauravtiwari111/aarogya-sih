import mongoose from 'mongoose'
import { Conversation } from '../models/Conversation.js'

const QUESTIONS = [
  {
    id: 'q1',
    promptEn: 'What is your main health concern today?',
    promptHi: 'आज आपकी मुख्य स्वास्थ्य चिंता क्या है?',
    tapOptions: [
      { label: 'Chest discomfort', labelHi: 'सीने में दर्द / बेचैनी', value: 'Chest discomfort' },
      { label: 'Shortness of breath', labelHi: 'सांस लेने में तकलीफ', value: 'Shortness of breath' },
      { label: 'Fever & cough', labelHi: 'बुखार और खांसी', value: 'Fever and cough' },
      { label: 'Abdominal pain', labelHi: 'पेट दर्द', value: 'Abdominal pain' },
    ],
    mapsTo: 'chiefComplaint',
  },
  {
    id: 'q2',
    promptEn: 'How long have you had this concern?',
    promptHi: 'आपको यह समस्या कितने समय से है?',
    tapOptions: [
      { label: 'Less than 24 hrs', labelHi: '24 घंटे से कम', value: 'Less than 24 hours' },
      { label: '2–3 days', labelHi: '2–3 दिन', value: '2-3 days' },
      { label: '1 week', labelHi: '1 सप्ताह', value: '1 week' },
      { label: 'More than a month', labelHi: 'एक महीने से अधिक', value: 'More than a month' },
    ],
    mapsTo: 'duration',
  },
  {
    id: 'q3',
    promptEn: 'Where exactly do you feel the pain or discomfort?',
    promptHi: 'आपको दर्द या बेचैनी ठीक कहाँ महसूस होती है?',
    tapOptions: [
      { label: 'Center of chest', labelHi: 'छाती के बीच में', value: 'Substernal chest region' },
      { label: 'Left side chest', labelHi: 'बाईं ओर छाती', value: 'Left chest area' },
      { label: 'Upper abdomen', labelHi: 'ऊपरी पेट', value: 'Upper abdomen' },
      { label: 'Not localized', labelHi: 'कोई निश्चित स्थान नहीं', value: 'Generalized discomfort' },
    ],
    mapsTo: 'location',
  },
  {
    id: 'q4',
    promptEn: 'Is the symptom constant or does it come and go?',
    promptHi: 'क्या यह लक्षण लगातार रहता है या आता-जाता है?',
    tapOptions: [
      { label: 'Comes and goes', labelHi: 'आता-जाता रहता है', value: 'Intermittent' },
      { label: 'Continuous', labelHi: 'लगातार बना हुआ है', value: 'Continuous' },
      { label: 'Only on exertion', labelHi: 'केवल काम या चलने पर', value: 'On physical exertion' },
    ],
    mapsTo: 'pattern',
  },
  {
    id: 'q5',
    promptEn: 'Are you experiencing any of these associated symptoms?',
    promptHi: 'क्या आप इनमें से कोई संबंधित लक्षण महसूस कर रहे हैं?',
    tapOptions: [
      { label: 'Shortness of breath', labelHi: 'सांस फूलना', value: 'Shortness of breath' },
      { label: 'Sweating / Nausea', labelHi: 'पसीना / मिचली', value: 'Sweating and nausea' },
      { label: 'Dizziness', labelHi: 'चक्कर आना', value: 'Dizziness' },
      { label: 'None of these', labelHi: 'इनमें से कोई नहीं', value: 'None reported' },
    ],
    mapsTo: 'associatedSymptoms',
  },
  {
    id: 'q6',
    promptEn: 'Does anything make the pain or discomfort worse?',
    promptHi: 'क्या किसी गतिविधि से दर्द या तकलीफ बढ़ जाती है?',
    tapOptions: [
      { label: 'Walking / Stair climbing', labelHi: 'चलना / सीढ़ी चढ़ना', value: 'Physical exertion / climbing stairs' },
      { label: 'Deep breathing', labelHi: 'गहरी सांस लेना', value: 'Deep inspiration' },
      { label: 'Pressing chest', labelHi: 'छाती दबाने पर', value: 'Local pressure' },
      { label: 'Nothing specific', labelHi: 'कुछ खास नहीं', value: 'Nothing specific' },
    ],
    mapsTo: 'aggravating',
  },
  {
    id: 'q7',
    promptEn: 'Does resting or anything else relieve the symptom?',
    promptHi: 'क्या आराम करने से राहत मिलती है?',
    tapOptions: [
      { label: 'Resting helps', labelHi: 'आराम करने से राहत', value: 'Resting for 5-10 minutes' },
      { label: 'Sitting upright', labelHi: 'सीधे बैठने पर', value: 'Sitting upright' },
      { label: 'Warm water / Tea', labelHi: 'गरम पानी से', value: 'Warm fluids' },
      { label: 'No relief with rest', labelHi: 'आराम से राहत नहीं', value: 'No relief' },
    ],
    mapsTo: 'relieving',
  },
  {
    id: 'q8',
    promptEn: 'Do you have any existing medical conditions (like BP, Diabetes, Asthma)?',
    promptHi: 'क्या आपको पहले से कोई बीमारी है (जैसे बीपी, शुगर, अस्थामा)?',
    tapOptions: [
      { label: 'High BP (Hypertension)', labelHi: 'उच्च रक्तचाप (बीपी)', value: 'Hypertension (3 years)' },
      { label: 'Diabetes', labelHi: 'मधुमेह (शुगर)', value: 'Type 2 Diabetes' },
      { label: 'Asthma', labelHi: 'दमा (अस्थामा)', value: 'Asthma' },
      { label: 'No existing conditions', labelHi: 'कोई बीमारी नहीं', value: 'None reported' },
    ],
    mapsTo: 'pastHistory',
  },
  {
    id: 'q9',
    promptEn: 'Are you currently taking any regular medications?',
    promptHi: 'क्या आप वर्तमान में कोई नियमित दवाएं ले रहे हैं?',
    tapOptions: [
      { label: 'BP medicines', labelHi: 'बीपी की दवाएं', value: 'Amlodipine 5mg' },
      { label: 'Diabetes medicines', labelHi: 'शुगर की दवाएं', value: 'Metformin 500mg' },
      { label: 'Cholesterol medicines', labelHi: 'कोलेस्ट्रॉल की दवाएं', value: 'Atorvastatin 10mg' },
      { label: 'No regular medicines', labelHi: 'कोई नियमित दवा नहीं', value: 'None reported' },
    ],
    mapsTo: 'medications',
  },
  {
    id: 'q10',
    promptEn: 'Do you have any known allergies to medicines or food?',
    promptHi: 'क्या आपको किसी दवा या भोजन से एलर्जी है?',
    tapOptions: [
      { label: 'Penicillin', labelHi: 'पेनिसिलिन', value: 'Penicillin allergy' },
      { label: 'Sulfa drugs', labelHi: 'सल्फा दवाएं', value: 'Sulfa allergy' },
      { label: 'No known allergies', labelHi: 'कोई एलर्जी नहीं', value: 'No known drug allergies (NKDA)' },
    ],
    mapsTo: 'allergies',
  },
]

export function getQuestions(req, res) {
  res.json(QUESTIONS)
}

export async function submitConversation(req, res, next) {
  try {
    const { patientId = 'PTH100125', answers = [], messages = [] } = req.body

    if (mongoose.connection.readyState === 1) {
      let conv = await Conversation.findOne({ patientId })
      if (!conv) {
        conv = await Conversation.create({
          patientId,
          answers,
          messages,
        })
      } else {
        conv.answers = answers
        if (messages.length) conv.messages = messages
        await conv.save()
      }
      return res.json(conv)
    }

    res.json({ patientId, answers, messages })
  } catch (error) {
    res.json({ patientId: req.body.patientId || 'PTH100125', answers: req.body.answers || [] })
  }
}

export async function getConversation(req, res, next) {
  try {
    const { patientId } = req.params
    if (mongoose.connection.readyState === 1) {
      const conv = await Conversation.findOne({ patientId })
      if (conv) return res.json(conv)
    }
    res.json({ patientId, answers: [], messages: [] })
  } catch (error) {
    res.json({ patientId: req.params.patientId, answers: [], messages: [] })
  }
}

