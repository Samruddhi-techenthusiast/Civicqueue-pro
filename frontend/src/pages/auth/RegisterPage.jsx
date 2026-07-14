import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Phone, Shield, Eye, EyeOff } from 'lucide-react'
import { useAppDispatch, useAuth } from '../../hooks'
import { register, clearError } from '../../store/slices/authSlice'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error } = useAuth()
  const [showPwd, setShowPwd] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(clearError())
    const res = await dispatch(register({ ...form, role: 'citizen' }))
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Account created! Welcome to CivicQueue.')
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-[var(--bg)]">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center gap-2.5 mb-8">
          <img
               src="/civicQueue.png"
                alt="CivicQueue Logo"
                className="w-10 h-10 object-contain"
              />
          <span className="font-bold text-[var(--text-primary)]">CivicQueue</span>
        </div>

        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Create account</h1>
        <p className="text-[var(--text-secondary)] mb-8">
          Already have one? <Link to="/login" className="text-civic-500 hover:text-civic-600 font-medium">Sign in</Link>
        </p>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-6 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full name" type="text" icon={User} required placeholder="Rahul Sharma"
            value={form.name} onChange={set('name')} />
          <Input label="Email address" type="email" icon={Mail} required placeholder="you@example.com"
            value={form.email} onChange={set('email')} />
          <Input label="Mobile number" type="tel" icon={Phone} placeholder="9876543210"
            value={form.phone} onChange={set('phone')} hint="10-digit Indian mobile number" />
          <div className="flex flex-col gap-1">
            <label className="label">Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"><Lock className="w-4 h-4" /></span>
              <input type={showPwd ? 'text' : 'password'} required minLength={8}
                className="input pl-10 pr-10" placeholder="Min. 8 characters"
                value={form.password} onChange={set('password')} />
              <button type="button" onClick={() => setShowPwd(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">
            Create account
          </Button>
        </form>

        <p className="text-xs text-[var(--text-muted)] text-center mt-6">
          By creating an account you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  )
}
