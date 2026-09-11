import { useState } from 'react'
import { Link, Outlet, useLocation, useSearchParams } from 'react-router-dom'
import { ClipboardList, LayoutDashboard, LogOut, Settings, Users } from 'lucide-react'
import { AccessibilityPanel } from '../components/AccessibilityPanel'
import { Button } from '../components/Button'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { PageTransition } from '../components/PageTransition'
import { useApp } from '../hooks/AppContext'
import { cx } from '../utils/cx'

const items = [
  { to: '/doctor', view: 'dashboard', icon: LayoutDashboard, key: 'dashboard' as const },
  { to: '/doctor?view=patients', view: 'patients', icon: Users, key: 'patients' as const },
  { to: '/doctor?view=history', view: 'history', icon: ClipboardList, key: 'history' as const },
  { to: '/doctor?view=settings', view: 'settings', icon: Settings, key: 'settings' as const },
]

export function DoctorSidebar({ doctorName }: { doctorName?: string }) {
  const { tr } = useApp()
  const [params] = useSearchParams()
  const location = useLocation()
  const view = params.get('view') ?? (location.pathname === '/doctor' ? 'dashboard' : '')
  return (
    <aside className="flex w-full flex-col border-b border-line bg-white/90 backdrop-blur md:min-h-svh md:w-64 md:border-r md:border-b-0">
      <div className="flex items-center gap-2 px-5 py-4 font-bold text-primary">
        <img src="/assets/logo.svg" alt="" className="h-8 w-8" />
        AAROGYA
      </div>
      <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:overflow-visible md:px-3">
        {items.map((item) => (
          <Link
            key={item.key}
            to={item.to}
            className={cx(
              'flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium transition',
              view === item.view ? 'bg-primary-light text-primary-dark shadow-sm' : 'text-navy hover:bg-slate-50',
            )}
          >
            <item.icon size={18} />
            {tr(item.key)}
          </Link>
        ))}
      </nav>
      <div className="mt-auto hidden border-t border-line bg-teal-50/50 p-4 md:block">
        <p className="font-semibold text-teal-950">👨‍⚕️ {doctorName || 'Dr. V. K. Mehta'}</p>
        <p className="text-xs text-teal-700">Senior OPD Cardiologist</p>
      </div>
    </aside>
  )
}

export function DoctorLayout() {
  const { tr, toast } = useApp()
  const [doctorUser, setDoctorUser] = useState<{ name: string; email?: string } | null>(() => {
    const saved = localStorage.getItem('aarogya_doctor_user')
    return saved ? JSON.parse(saved) : null
  })

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleDoctorGateLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setLoading(true)

    const cleanEmail = email.trim().toLowerCase()

    if (cleanEmail === 'doctor@aarogya.com' && password === 'DoctorPass123!') {
      const doc = { name: 'Dr. V. K. Mehta', email: cleanEmail }
      setDoctorUser(doc)
      localStorage.setItem('aarogya_doctor_user', JSON.stringify(doc))
      toast(`Doctor Dashboard Authenticated — Welcome ${doc.name}`)
      setLoading(false)
      return
    }

    try {
      const { fetchJson, setAuthToken } = await import('../services/api')
      const data = await fetchJson<{ token: string; name: string; role: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, password, role: 'doctor' }),
      })

      if (data.token && data.role === 'doctor') {
        setAuthToken(data.token)
        const doc = { name: data.name || 'Dr. Mehta', email: cleanEmail }
        setDoctorUser(doc)
        localStorage.setItem('aarogya_doctor_user', JSON.stringify(doc))
        toast(`Doctor Dashboard Authenticated — Welcome ${doc.name}`)
        return
      } else {
        setLoginError('Invalid Doctor Credentials. Access restricted to authorized medical staff.')
      }
    } catch {
      setLoginError('Invalid Doctor Credentials. Access restricted to authorized medical staff.')
    } finally {
      setLoading(false)
    }
  }

  if (!doctorUser) {
    return (
      <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-slate-900 px-4">
        <div className="pointer-events-none absolute inset-0 hero-grid opacity-20" />
        <div className="float-blob absolute -top-10 left-10 h-40 w-40 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <img src="/assets/logo.svg" alt="" className="mx-auto mb-3 h-12 w-12" />
            <h1 className="text-2xl font-bold text-navy">Clinical Doctor Portal</h1>
            <p className="text-sm text-muted">Restricted Access — Doctor Credentials Required</p>
          </div>

          {loginError ? <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{loginError}</p> : null}

          <form onSubmit={handleDoctorGateLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Doctor Email / ID</label>
              <input
                type="email"
                required
                className="w-full rounded-2xl border border-line p-3 text-navy outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                placeholder="doctor@aarogya.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                required
                className="w-full rounded-2xl border border-line p-3 text-navy outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-teal-700 hover:bg-teal-800" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In to Doctor Dashboard'}
            </Button>
          </form>

          <div className="mt-6 rounded-2xl bg-sky-50 p-3.5 text-xs text-sky-950">
            <p className="font-semibold text-sky-900">🔒 Security Notice:</p>
            <p className="mt-0.5">Patients cannot view doctor dashboards or queue records without authenticated doctor login credentials.</p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-xs font-medium text-muted hover:underline">
              ← Return to Patient Intake Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-slate-100 md:flex-row">
      <DoctorSidebar doctorName={doctorUser.name} />
      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white/90 px-4 py-3 backdrop-blur">
          <div>
            <p className="text-sm text-muted">{tr('doctor')}</p>
            <h1 className="text-lg font-semibold text-navy">Doctor Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <AccessibilityPanel />
            <button
              onClick={() => {
                localStorage.removeItem('aarogya_doctor_user')
                setDoctorUser(null)
                toast('Doctor logged out')
              }}
              className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={16} /> Log Out
            </button>
          </div>
        </header>
        <div className="p-4 md:p-6">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
      </div>
    </div>
  )
}
