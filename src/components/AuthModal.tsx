import { useState } from 'react'
import { fetchJson, setAuthToken } from '../services/api'
import { Button } from './Button'
import { Input } from './Input'
import { Modal } from './Modal'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialRole?: 'patient' | 'doctor'
  onSuccess: (user: { name: string; role: string; patientId?: string }) => void
}

export function AuthModal({ isOpen, onClose, initialRole = 'patient', onSuccess }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'patient' | 'doctor'>(initialRole)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login'
      const payload = isRegister ? { name, email, password, role } : { email, password, role }
      const data = await fetchJson<{ token: string; name: string; role: string; patientId?: string }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      if (data.token) {
        setAuthToken(data.token)
        onSuccess({ name: data.name, role: data.role, patientId: data.patientId })
        onClose()
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }


  return (
    <Modal open={isOpen} onClose={onClose} title={isRegister ? 'Create AAROGYA Account' : 'Sign In to AAROGYA'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}

        {isRegister ? (
          <div>
            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
        ) : null}

        <div>
          <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div>
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        {isRegister ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Account Role</label>
            <select
              className="w-full rounded-2xl border border-line bg-white p-3 text-navy"
              value={role}
              onChange={(e) => setRole(e.target.value as 'patient' | 'doctor')}
            >
              <option value="patient">Patient / Individual</option>
              <option value="doctor">Healthcare Professional / Doctor</option>
            </select>
          </div>
        ) : null}

        <Button type="submit" className="w-full py-3" disabled={loading}>
          {loading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}
        </Button>

        <div className="text-center pt-2">
          <button
            type="button"
            className="text-sm font-medium text-primary hover:underline"
            onClick={() => {
              setIsRegister(!isRegister)
              setError('')
            }}
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register here"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
