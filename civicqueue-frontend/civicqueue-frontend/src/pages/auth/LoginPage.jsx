import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Shield, Eye, EyeOff } from 'lucide-react'
import { useAppDispatch, useAuth } from '../../hooks'
import { login, clearError } from '../../store/slices/authSlice'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'
import { ROLES } from '../../constants'

export default function LoginPage({ isAdmin }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { loading, error } = useAuth()
  const [showPwd, setShowPwd] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(clearError())
    const res = await dispatch(login(form))
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Welcome back!')
      const user = res.payload.user
      const from = location.state?.from?.pathname
      const redirect = from || (
        [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(user.role) ? '/admin' :
        user.role === ROLES.STAFF ? '/staff' : '/dashboard'
      )
      navigate(redirect, { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex bg-[var(--bg)]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-civic-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-civic-500/20 rounded-full blur-3xl" />
        <div className="relative flex flex-col justify-center px-16 py-12">
          <div className="flex items-center gap-3 mb-16">
            <img
                src="/civicQueue.png"
                 alt="CivicQueue Logo"
                  className="w-10 h-10 object-contain"
               />
            <span className="text-xl font-bold text-white">CivicQueue</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            {isAdmin ? 'Government Staff Portal' : 'Your queue, your time'}
          </h2>
          <p className="text-civic-300 text-lg leading-relaxed mb-10">
            {isAdmin
              ? 'Manage departments, queues, and citizen flow from one unified dashboard.'
              : 'Book tokens, track wait times, and get notified when your turn comes.'}
          </p>
          <div className="space-y-4">
            {['Real-time queue tracking', 'Smart token generation', 'Appointment scheduling'].map(f => (
              <div key={f} className="flex items-center gap-3 text-civic-200">
                <div className="w-5 h-5 rounded-full bg-civic-500/30 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-civic-400" />
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
           <img
             src="/civicQueue.png"
              alt="CivicQueue Logo"
              className="w-10 h-10 object-contain"
             />
            <span className="font-bold text-[var(--text-primary)]">CivicQueue</span>
          </div>

          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            {isAdmin ? 'Staff sign in' : 'Welcome back'}
          </h1>
          <p className="text-[var(--text-secondary)] mb-8">
            {isAdmin ? 'Sign in to your staff or admin account'  : "Don't have an account? "}
            {!isAdmin && <Link to="/register" className="text-civic-500 hover:text-civic-600 font-medium">Sign up free</Link>}
          </p>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mb-6 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address" type="email" icon={Mail} required
              placeholder="you@example.com"
              value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            />
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-civic-500 hover:text-civic-600">Forgot password?</Link>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"><Lock className="w-4 h-4" /></span>
                <input
                  type={showPwd ? 'text' : 'password'} required
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" fullWidth loading={loading} size="lg">
              Sign in
            </Button>
          </form>

          {!isAdmin && (
            <div className="mt-6 pt-6 border-t border-[var(--border)]">
              <p className="text-center text-sm text-[var(--text-muted)] mb-3">Staff or admin?</p>
              <Link to="/admin-login" className="btn-secondary w-full flex items-center justify-center gap-2 text-sm">
                <Shield className="w-4 h-4" /> Sign in as Staff / Admin
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
