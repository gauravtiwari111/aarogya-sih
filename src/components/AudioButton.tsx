import { Volume2 } from 'lucide-react'
import { useApp } from '../hooks/AppContext'
import { canSpeak, speak } from '../services/speechService'
import { Button } from './Button'

export function AudioButton({ text, label }: { text: string; label?: string }) {
  const { lang, tr, toast } = useApp()
  return (
    <Button
      variant="soft"
      className="px-4"
      aria-label={label ?? tr('listen')}
      onClick={() => {
        const ok = speak(text, lang)
        if (!ok) toast(tr('audioUnavailable'))
        else if (!canSpeak()) toast(tr('audioUnavailable'))
      }}
    >
      <Volume2 size={18} />
      {label ?? tr('listen')}
    </Button>
  )
}
