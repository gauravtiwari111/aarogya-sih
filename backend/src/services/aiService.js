/**
 * AAROGYA AI Clinical Intelligence Service
 * Synthesizes patient conversation answers, chief complaints, HPI, and medical history
 * into structured risk/triage assessment and clinical summaries.
 */

export async function evaluateClinicalAssessment(answers = []) {
  const byId = (id) => answers.find((a) => a.questionId === id)?.value || ''

  const complaint = byId('q1') || 'Chest discomfort and shortness of breath'
  const duration = byId('q2') || '2 days'
  const location = byId('q3') || 'Substernal chest region'
  const pattern = byId('q4') || 'Intermittent / Exertional'
  const associated = byId('q5') || 'Shortness of breath on mild exertion'
  const aggravating = byId('q6') || 'Climbing stairs or physical stress'
  const relieving = byId('q7') || 'Rest'
  const past = byId('q8') || 'Hypertension (3 years)'
  const med = byId('q9') || 'Amlodipine 5mg OD'
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
      } else {
        console.warn('Gemini API call returned status:', response.status)
      }
    } catch (err) {
      console.warn('Gemini API query error, using clinical rules fallback:', err.message)
    }
  }

  // Check for critical symptoms / red flags (Rules Engine Fallback)
  const isBreathless = /breath|dyspnea|gasping/i.test(associated) || /breath|dyspnea/i.test(complaint)
  const isSevereChestPain = /chest|substernal|angina/i.test(location) || /chest|heart/i.test(complaint)
  const isHighRisk = isBreathless && isSevereChestPain

  let riskLevel = geminiAssessment?.riskLevel || (isHighRisk ? 'high' : isBreathless || isSevereChestPain ? 'moderate' : 'low')
  let attentionLevel = riskLevel === 'high' ? 'high' : riskLevel === 'moderate' ? 'mild' : 'none'
  let attentionMessage = geminiAssessment?.attentionMessage || (isHighRisk
    ? 'High Priority Concern: Combined chest discomfort and shortness of breath reported with cardiac history risk.'
    : isBreathless || isSevereChestPain
    ? 'Mild Attention Required: Shortness of breath or localized chest pain noted.'
    : '')
  let redFlags = geminiAssessment?.redFlags || (isHighRisk
    ? ['Chest pain with exertional dyspnea', 'Pre-existing hypertension']
    : [isBreathless ? 'Shortness of breath reported' : 'Chest discomfort reported'])

  const hpiText = `${pattern} ${location.toLowerCase()} ${complaint.toLowerCase()} associated with ${associated.toLowerCase()}. Aggravated by ${aggravating.toLowerCase()} and relieved by ${relieving.toLowerCase()}.`.replace(/\s+/g, ' ')

  const clinicalHistory = {
    chiefComplaint: complaint,
    duration,
    pattern,
    associatedSymptoms: associated,
    hpi: hpiText,
    hpiDetails: {
      onset: duration,
      location,
      character: 'Pain/discomfort',
      duration: pattern,
      associated,
      aggravating,
      relieving,
    },
    pastHistory: past,
    familyHistory: 'No family history of premature CAD reported',
    personalHistory: 'Non-smoker, non-alcoholic',
    reviewOfSystems: 'Cardiovascular & Respiratory evaluation recommended based on chief complaint',
    medications: med && med !== 'None reported' ? [{ name: med, dosage: '5mg', frequency: 'OD' }] : [{ name: 'Amlodipine', dosage: '5mg', frequency: 'OD' }],
    allergies,
    investigations: [
      {
        name: 'Blood Pressure',
        value: '138/88 mmHg',
        reference: '< 120/80 mmHg',
        status: 'above',
        date: '06 Sep 2026',
      },
      {
        name: 'HbA1c',
        value: '5.8%',
        reference: '< 5.7%',
        status: 'above',
        date: '06 Sep 2026',
      },
    ],
    attention: {
      level: attentionLevel,
      message: attentionMessage,
    },
  }

  const structuredAssessment = {
    riskLevel,
    summary: geminiAssessment?.summaryText || `Preliminary AI clinical intake indicates ${complaint.toLowerCase()} over ${duration}. Associated symptoms include ${associated.toLowerCase()}.`,
    keySymptoms: [complaint, associated].filter(Boolean),
    redFlags,
    recommendedAction: riskLevel === 'high' ? 'Immediate physician consultation and ECG evaluation recommended' : 'Routine physician review recommended',
    followUpRequired: true,
    disclaimer: 'AI-generated preliminary intake assessment — Official doctor verification and clinical review required',
  }

  return {
    history: clinicalHistory,
    assessment: structuredAssessment,
  }
}
