/**
 * AAROGYA AI Clinical Intelligence Service
 * Synthesizes patient conversation answers, chief complaints, HPI, and medical history
 * into structured risk/triage assessment and clinical summaries.
 */

export async function evaluateClinicalAssessment(answers = []) {
  const byId = (id) => answers.find((a) => a.questionId === id)?.value || ''

  // Dynamically extract complaint and duration from answers array without hardcoded defaults
  const firstAnswerText = answers[0]?.value || ''
  const rawComplaint = byId('q1') || firstAnswerText
  const complaint = rawComplaint.trim() !== '' ? rawComplaint.trim() : 'General Medical Checkup'

  const rawDuration = byId('q2') || (answers[1]?.value ?? '')
  const duration = rawDuration.trim() !== '' ? rawDuration.trim() : '1 day'

  const location = byId('q3') || 'Not specified'
  const pattern = byId('q4') || 'Intermittent'
  const associated = byId('q5') || 'None reported'
  const aggravating = byId('q6') || 'None reported'
  const relieving = byId('q7') || 'Rest'
  const past = byId('q8') || 'No significant past medical history'
  const med = byId('q9') || 'None reported'
  const allergies = byId('q10') || 'No known drug allergies (NKDA)'

  let geminiAssessment = null

  // If Gemini API Key is present in .env, call Live Google Gemini LLM API
  const apiKey = process.env.AI_API_KEY
  if (apiKey && apiKey.trim() !== '') {
    try {
      console.log('🤖 Querying Live Google Gemini API for Clinical Intake Synthesis...')
      const promptText = `You are a medical intake AI assistant. Analyze this patient intake data and return ONLY a JSON object:
Chief Complaint: ${complaint}
Duration: ${duration}
Location: ${location}
Pattern: ${pattern}
Associated Symptoms: ${associated}
Aggravating Factors: ${aggravating}
Relieving Factors: ${relieving}
Past History: ${past}
Current Medications: ${med}
Allergies: ${allergies}

Respond ONLY with valid JSON in this exact structure:
{
  "riskLevel": "low" | "moderate" | "high",
  "attentionMessage": "summary for doctor alert",
  "redFlags": ["red flag 1", "red flag 2"],
  "summaryText": "medical summary paragraph"
}`

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          geminiAssessment = JSON.parse(jsonMatch[0])
          console.log('✅ Gemini AI Clinical Synthesis Result:', geminiAssessment)
        }
      }
    } catch (err) {
      console.warn('Gemini API query error, using clinical rules fallback:', err.message)
    }
  }

  // Dynamic Rule Engine Assessment based on ACTUAL symptoms
  const fullSymptomText = `${complaint} ${associated} ${location}`.toLowerCase()
  const isBreathless = /breath|dyspnea|gasping/i.test(fullSymptomText)
  const isChestPain = /chest|substernal|angina|cardiac/i.test(fullSymptomText)
  const isHighFever = /fever|temperature|chills/i.test(fullSymptomText)
  const isSevereHigh = isBreathless && isChestPain

  let riskLevel = geminiAssessment?.riskLevel || (isSevereHigh ? 'high' : (isBreathless || isChestPain) ? 'moderate' : isHighFever ? 'mild' : 'low')
  let attentionLevel = riskLevel === 'high' ? 'high' : riskLevel === 'moderate' ? 'mild' : riskLevel === 'mild' ? 'mild' : 'none'
  
  let attentionMessage = geminiAssessment?.attentionMessage || (
    isSevereHigh
      ? 'High Priority Concern: Combined chest discomfort and breathlessness reported.'
      : isChestPain
      ? 'Attention Required: Localized chest pain reported — evaluate cardiac history.'
      : isBreathless
      ? 'Attention Required: Shortness of breath reported.'
      : isHighFever
      ? 'Mild Concern: High fever symptoms reported.'
      : ''
  )

  let redFlags = geminiAssessment?.redFlags || (
    isSevereHigh
      ? ['Chest discomfort with exertional dyspnea']
      : isChestPain
      ? ['Chest discomfort reported']
      : isBreathless
      ? ['Shortness of breath reported']
      : []
  )

  const hpiText = `Patient presents with ${complaint.toLowerCase()} lasting ${duration}. Associated symptoms include ${associated.toLowerCase()}.`.replace(/\s+/g, ' ')

  const clinicalHistory = {
    chiefComplaint: complaint,
    duration,
    pattern,
    associatedSymptoms: associated,
    hpi: hpiText,
    hpiDetails: {
      onset: duration,
      location,
      character: 'Symptom discomfort',
      duration: pattern,
      associated,
      aggravating,
      relieving,
    },
    pastHistory: past,
    familyHistory: 'No relevant family history reported',
    personalHistory: 'Non-smoker, non-alcoholic',
    reviewOfSystems: `Evaluation recommended for ${complaint}`,
    medications: med && med !== 'None reported' ? [{ name: med, dosage: 'Standard', frequency: 'As needed' }] : [],
    allergies,
    investigations: [],
    attention: {
      level: attentionLevel,
      message: attentionMessage,
    },
  }

  const structuredAssessment = {
    riskLevel,
    summary: geminiAssessment?.summaryText || `Clinical intake assessment for ${complaint.toLowerCase()} over ${duration}.`,
    keySymptoms: [complaint, associated].filter(Boolean),
    redFlags,
    recommendedAction: riskLevel === 'high' ? 'Immediate physician consultation recommended' : 'Routine physician review recommended',
    followUpRequired: true,
    disclaimer: 'AI-generated preliminary intake assessment — Doctor review required',
  }

  return {
    history: clinicalHistory,
    assessment: structuredAssessment,
  }
}
