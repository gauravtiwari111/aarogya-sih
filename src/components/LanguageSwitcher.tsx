import { useApp } from '../hooks/AppContext'
import { cx } from '../utils/cx'

export function LanguageSwitcher() {
  const { lang, setLang, toast, tr } = useApp()
  return (
    <div className="inline-flex rounded-full border border-line bg-white/90 p-1 shadow-sm" role="group" aria-label="Language">
      {(['en', 'hi'] as const).map((code) => (
        <button
          key={code}
          type="button"
          className={cx(
            'min-h-10 rounded-full px-3 text-sm font-semibold transition',
            lang === code ? 'bg-primary text-white shadow-sm' : 'text-navy hover:bg-slate-50',
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
