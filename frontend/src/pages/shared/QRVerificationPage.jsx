import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, Search, CheckCircle, XCircle, Clock, Ticket, Building2 } from 'lucide-react'
import { Card } from '../../components/ui/index.jsx'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { formatDateTime, formatEWT, getTokenBadge } from '../../utils'
import api from '../../services/api'

export default function QRVerificationPage() {
  const [tokenId, setTokenId] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const verify = async (e) => {
    e.preventDefault()
    if (!tokenId.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const { data } = await api.get(`/queue/tokens/verify/${tokenId.trim()}`)
      setResult(data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Token not found')
    } finally { setLoading(false) }
  }

  const isValid = result?.isValid
  const token = result?.token

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="section-title">QR Token Verification</h2>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">Verify a citizen's queue token status</p>
      </div>

      <Card>
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-civic-50 dark:bg-civic-950/30 flex items-center justify-center mb-3">
            <QrCode className="w-8 h-8 text-civic-500" />
          </div>
          <h3 className="font-bold text-[var(--text-primary)]">Enter Token ID</h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">Paste the token ID from a scanned QR code</p>
        </div>

        <form onSubmit={verify} className="flex gap-2">
          <Input placeholder="Token ID..." value={tokenId} onChange={e => setTokenId(e.target.value)} className="flex-1" icon={Search} />
          <Button type="submit" loading={loading} icon={Search} className="flex-shrink-0">Verify</Button>
        </form>
      </Card>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="border-red-200 dark:border-red-900">
              <div className="flex items-center gap-3">
                <XCircle className="w-10 h-10 text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-600 dark:text-red-400">Verification Failed</p>
                  <p className="text-sm text-[var(--text-muted)]">{error}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {result && token && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <Card className={isValid ? 'border-emerald-200 dark:border-emerald-900' : 'border-slate-200 dark:border-slate-700'}>
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isValid ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-slate-50 dark:bg-surface-800'}`}>
                  {isValid ? <CheckCircle className="w-7 h-7 text-emerald-500" /> : <XCircle className="w-7 h-7 text-slate-400" />}
                </div>
                <div>
                  <p className={`font-bold ${isValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-secondary)]'}`}>
                    {isValid ? 'Valid Token' : 'Token Not Active'}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">{result.message}</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-surface-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Token Number</span>
                  <span className="font-mono font-bold text-[var(--text-primary)] text-lg">{token.tokenNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)] flex items-center gap-1.5"><Building2 className="w-4 h-4" />Department</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{token.department?.name || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)] flex items-center gap-1.5"><Ticket className="w-4 h-4" />Citizen</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{token.citizenName || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Status</span>
                  <span className={getTokenBadge(token.status)}>{token.status}</span>
                </div>
                {token.status === 'waiting' && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-muted)] flex items-center gap-1.5"><Clock className="w-4 h-4" />Est. Wait</span>
                    <span className="text-sm font-medium text-amber-600">{formatEWT(token.estimatedWaitMinutes)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Issued At</span>
                  <span className="text-sm text-[var(--text-secondary)]">{formatDateTime(token.issuedAt)}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
