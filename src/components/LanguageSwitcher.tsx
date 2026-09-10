import { useApp } from '../hooks/AppContext'
import { cx } from '../utils/cx'

export function LanguageSwitcher() {
  const { lang, setLang, toast, tr } = useApp()
  return (
    <div className="inline-flex rounded-full border border-line bg-white p-1" role="group" aria-label="Language">
      {(['en', 'hi'] as const).map((code) => (
        <button
          key={code}
          type="button"
          className={cx(
            'min-h-10 rounded-full px-3 text-sm font-semibold',
            lang === code ? 'bg-primary text-white' : 'text-navy',
          )}
          aria-pressed={lang === code}
          onClick={() => {
            if (code === lang) return
            setLang(code)
            toast(tr('langChanged'))
          }}
        >
          {code === 'en' ? 'EN' : 'हिंदी'}
        </button>
      ))}
    </div>
  )
}
