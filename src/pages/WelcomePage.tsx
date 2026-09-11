import { useState } from 'react'
import { motion } from 'framer-motion'
import { Hand, Mic, ShieldCheck, Sparkles, Stethoscope, UserCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AccessibilityPanel } from '../components/AccessibilityPanel'
import { AudioButton } from '../components/AudioButton'
import { AuthModal } from '../components/AuthModal'
import { Button } from '../components/Button'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { fadeUp, PageTransition, stagger } from '../components/PageTransition'
import { useApp } from '../hooks/AppContext'

export function WelcomePage() {
  const navigate = useNavigate()
  const { tr, resetSession, toast } = useApp()
  const [authOpen, setAuthOpen] = useState(false)

  function go(path: string) {
    resetSession()
    navigate(path)
  }

  return (
    <PageTransition className="relative min-h-svh overflow-hidden">
      <FloatingShapes />
      <header className="relative z-10 flex items-center justify-end gap-2 px-4 py-4">
        <LanguageSwitcher />
        <AudioButton text={`${tr('brand')}. ${tr('tagline')}. ${tr('statement')}`} />
        <AccessibilityPanel />
        <Button variant="outline" className="px-3 py-1.5 text-sm" onClick={() => setAuthOpen(true)}>
          <UserCheck size={16} /> Sign In
        </Button>
      </header>
      <motion.div
        className="relative z-10 mx-auto flex min-h-[calc(100svh-5.5rem)] max-w-3xl flex-col items-center justify-center px-4 py-6 text-center"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp} className="relative mb-5">
          <span className="absolute inset-0 rounded-full bg-primary/20" style={{ animation: 'pulse-ring 2.4s ease-out infinite' }} />
          <motion.img
            src="/assets/logo.svg"
            alt=""
            className="relative h-20 w-20 rounded-2xl bg-white p-2 shadow-lg"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
        <motion.h1 variants={fadeUp} className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          {tr('brand')}
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-2 text-lg text-primary-dark">
          {tr('tagline')}
        </motion.p>
        <motion.p variants={fadeUp} className="mt-3 max-w-xl text-muted">
          {tr('statement')}
        </motion.p>
        <motion.p variants={fadeUp} className="mt-2 max-w-xl text-sm text-muted">
          {tr('core')}
        </motion.p>
        <motion.div variants={fadeUp} className="mt-5 flex flex-wrap justify-center gap-2">
          {[
            { icon: Mic, label: 'Voice intake' },
            { icon: ShieldCheck, label: 'Privacy first' },
            { icon: Stethoscope, label: 'Doctor-ready summary' },
          ].map((item) => (
            <motion.span
              key={item.label}
              whileHover={{ y: -2, scale: 1.03 }}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/80 px-3 py-1.5 text-xs font-semibold text-navy shadow-sm"
            >
              <item.icon size={14} className="text-primary" />
              {item.label}
            </motion.span>
          ))}
        </motion.div>
        <motion.div variants={fadeUp} className="mt-6 flex w-full max-w-md flex-col gap-3">
          <Button className="w-full py-4 text-lg" onClick={() => go('/consent')}>
            <Sparkles size={18} /> {tr('start')}
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => go('/consent')}>
              <Mic size={18} /> {tr('speak')}
            </Button>
            <Button variant="outline" onClick={() => go('/consent')}>
              <Hand size={18} /> {tr('tapAnswer')}
            </Button>
          </div>
          <div className="mt-2 flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1 border border-line text-sm" onClick={() => setAuthOpen(true)}>
              <UserCheck size={16} /> Patient Account
            </Button>
            <Button variant="outline" className="flex-1 border-teal-600 text-sm text-teal-700 hover:bg-teal-50" onClick={() => navigate('/doctor')}>
              Doctor Portal →
            </Button>
          </div>
        </motion.div>
      </motion.div>
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={(user) => {
          toast(`Welcome ${user.name}! Account signed in.`)
          resetSession(user.patientId, user.name)
          if (user.role === 'doctor') {
            navigate('/doctor')
          }
        }}
      />
    </PageTransition>
  )
}

function FloatingShapes() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden hero-grid">
      <div className="float-blob absolute top-16 left-8 h-36 w-36 rounded-full bg-teal-200/50 blur-3xl" />
      <div className="float-blob absolute right-10 bottom-24 h-44 w-44 rounded-full bg-sky-200/60 blur-3xl" style={{ animationDelay: '1.4s' }} />
      <div className="absolute top-1/3 right-1/4 h-16 w-16 rotate-12 rounded-2xl border-4 border-teal-300/40" />
    </div>
  )
}
