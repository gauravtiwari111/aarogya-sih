import { useState } from 'react'
import { Mic } from 'lucide-react'
import { useApp } from '../hooks/AppContext'
import { canListen, listenOnce } from '../services/speechService'
import { Button } from './Button'

export function VoiceInput({ onResult }: { onResult: (text: string, demo: boolean) => void }) {
  const { lang, tr } = useApp()
  const [listening, setListening] = useState(false)

  async function start() {
    setListening(true)
    const result = await listenOnce(lang)
    setListening(false)
    onResult(result.text, result.demo || !canListen())
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button variant="primary" onClick={() => void start()} disabled={listening} aria-label={tr('speak')}>
        <Mic size={18} />
        {listening ? tr('listening') : tr('speak')}
      </Button>
      {listening ? <Waveform /> : null}
    </div>
  )
}

export function Waveform() {
  return (
    <div className="flex h-10 items-end gap-1" aria-hidden>
      {Array.from({ length: 9 }).map((_, i) => (
        <span
          key={i}
          className="w-1.5 rounded-full bg-primary"
          style={{
            height: `${10 + ((i * 7) % 24)}px`,
            animation: 'pulse 0.9s ease-in-out infinite',
            animationDelay: `${i * 80}ms`,
          }}
        />
      ))}
    </div>
  )
}
