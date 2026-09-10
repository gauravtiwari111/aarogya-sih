import { DEMO_VOICE_ANSWER } from '../data/demoData'
import type { Language } from '../types'
import { wait } from './api'

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speak(text: string, lang: Language): boolean {
  if (!canSpeak()) return false
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
  utter.rate = 0.95
  window.speechSynthesis.speak(utter)
  return true
}

export function stopSpeaking(): void {
  if (canSpeak()) window.speechSynthesis.cancel()
}

function recognitionCtor(): (new () => SpeechRecognition) | undefined {
  return window.SpeechRecognition ?? window.webkitSpeechRecognition
}

export function canListen(): boolean {
  return Boolean(recognitionCtor())
}

export async function listenOnce(lang: Language): Promise<{ text: string; demo: boolean }> {
  const Ctor = recognitionCtor()
  if (!Ctor) {
    await wait(1400)
    return { text: DEMO_VOICE_ANSWER, demo: true }
  }

  return new Promise((resolve) => {
    const rec = new Ctor()
    rec.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.onresult = (event) => {
      const text = event.results[0]?.[0]?.transcript ?? DEMO_VOICE_ANSWER
      resolve({ text, demo: false })
    }
    rec.onerror = () => {
      void wait(400).then(() => resolve({ text: DEMO_VOICE_ANSWER, demo: true }))
    }
    rec.onend = () => undefined
    try {
      rec.start()
    } catch {
      void wait(800).then(() => resolve({ text: DEMO_VOICE_ANSWER, demo: true }))
    }
  })
}
