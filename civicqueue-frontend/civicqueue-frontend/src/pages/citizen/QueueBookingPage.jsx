import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Ticket, Clock, ChevronRight, Search, CheckCircle, AlertCircle, Users } from 'lucide-react'
import { useAppDispatch, useDepartments, useQueue } from '../../hooks'
import { fetchDepartments } from '../../store/slices/otherSlices'
import { issueToken, fetchQueueStatus } from '../../store/slices/queueSlice'
import { Card, Select } from '../../components/ui/index.jsx'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { formatEWT } from '../../utils'
import toast from 'react-hot-toast'
import { QRCodeSVG as QRCode } from 'qrcode.react'

const steps = ['Select Department', 'Queue Details', 'Confirm & Get Token']

export default function QueueBookingPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { list: depts, loading: deptsLoading } = useDepartments()
  const { status: queueStatus, issuing } = useQueue()
  const [step, setStep] = useState(0)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [priority, setPriority] = useState('normal')
  const [serviceType, setServiceType] = useState('')
  const [issuedToken, setIssuedToken] = useState(null)

  useEffect(() => {
    dispatch(fetchDepartments({ limit: 50 }))
    const preselect = searchParams.get('dept')
    if (preselect) {
      setSelected({ _id: preselect })
      setStep(1)
    }
  }, [])

  useEffect(() => {
    if (selected?._id) dispatch(fetchQueueStatus(selected._id))
  }, [selected])

  const filtered = depts.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelectDept = (dept) => {
    setSelected(dept); setStep(1)
  }

  const handleIssue = async () => {
    const res = await dispatch(issueToken({
      departmentId: selected._id,
      serviceType: serviceType || 'General',
      priority,
    }))
    if (res.meta.requestStatus === 'fulfilled') {
      setIssuedToken(res.payload)
      setStep(2)
      toast.success('Token issued successfully!')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Stepper */}
      <div className="flex items-center gap-0">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                ${i < step ? 'bg-civic-500 text-white' : i === step ? 'bg-civic-500 text-white ring-4 ring-civic-100 dark:ring-civic-900' : 'bg-slate-200 dark:bg-surface-700 text-[var(--text-muted)]'}`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-civic-500' : 'bg-slate-200 dark:bg-surface-700'}`} />}
          </div>
        ))}
      </div>

      {/* Step 0: Select department */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Select Department</h2>
              <p className="text-sm text-[var(--text-muted)] mb-5">Choose the government department you want to visit</p>
              <Input icon={Search} placeholder="Search departments..." value={search} onChange={e => setSearch(e.target.value)} className="mb-4" />
              {deptsLoading ? (
                <div className="grid gap-3">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-8 text-[var(--text-muted)] text-sm">No departments found</div>
              ) : (
                <div className="grid gap-3">
                  {filtered.map((d, i) => (
                    <motion.button key={d._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      onClick={() => handleSelectDept(d)}
                      className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] hover:border-civic-400 hover:bg-civic-50 dark:hover:bg-civic-950/20 transition-all text-left group w-full">
                      <div className="w-12 h-12 rounded-xl bg-civic-100 dark:bg-civic-950/40 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-civic-600 dark:text-civic-400 text-sm">{d.code}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[var(--text-primary)] text-sm">{d.name}</p>
                        {d.location && <p className="text-xs text-[var(--text-muted)] mt-0.5">{d.location}</p>}
                        <p className="text-xs text-[var(--text-muted)]">~{d.avgServiceTimeMinutes} min avg service</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-civic-500 transition-colors flex-shrink-0" />
                    </motion.button>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Step 1: Queue details */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            {/* Queue status */}
            {queueStatus && (
              <Card>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)]">{queueStatus.department?.name}</h3>
                    <p className="text-sm text-[var(--text-muted)]">Live queue status</p>
                  </div>
                  <span className={`badge-${queueStatus.queue?.status === 'open' ? 'green' : queueStatus.queue?.status === 'paused' ? 'amber' : 'gray'}`}>
                    {queueStatus.queue?.status || 'Closed'}
                  </span>
                </div>
                {queueStatus.queue ? (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Waiting', value: queueStatus.waitingCount, icon: Users, color: 'text-amber-500' },
                      { label: 'Now Serving', value: queueStatus.queue.nowServingNumber || '—', icon: Ticket, color: 'text-civic-500' },
                      { label: 'Est. Wait (new)', value: queueStatus.estimatedWaitForNew > 0 ? formatEWT(queueStatus.estimatedWaitForNew) : 'Next!', icon: Clock, color: 'text-emerald-500' },
                    ].map(s => (
                      <div key={s.label} className="text-center p-3 rounded-xl bg-slate-50 dark:bg-surface-800">
                        <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
                        <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    Queue has not been opened today. Please check back later.
                  </div>
                )}
              </Card>
            )}

            {/* Token options */}
            <Card>
              <h3 className="font-bold text-[var(--text-primary)] mb-4">Token Options</h3>
              <div className="space-y-4">
                <Select label="Service Type"
                  options={[
                    { value: 'General', label: 'General' },
                    ...(selected?.services?.length
                      ? selected.services.map(s => ({ value: s, label: s }))
                      : [
                          { value: 'Certificate', label: 'Certificate Services' },
                          { value: 'Grievance',   label: 'Grievance Redressal' },
                          { value: 'Payment',     label: 'Payment / Fees' },
                          { value: 'Enquiry',     label: 'Enquiry' },
                        ]
                    )
                  ]}
                  value={serviceType} onChange={e => setServiceType(e.target.value)}
                />
                <Select label="Priority"
                  options={[
                    { value: 'normal', label: 'Normal' },
                    { value: 'high',   label: 'High (Senior Citizen / Disabled)' },
                    { value: 'urgent', label: 'Urgent (Medical Emergency)' },
                  ]}
                  value={priority} onChange={e => setPriority(e.target.value)}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="secondary" onClick={() => setStep(0)} className="flex-1">Back</Button>
                <Button onClick={handleIssue} loading={issuing} className="flex-1"
                  disabled={!queueStatus?.queue || queueStatus.queue.status !== 'open'}>
                  Get Token
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Token issued */}
        {step === 2 && issuedToken && (
          <motion.div key="step2" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <Card className="text-center">
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                className="w-20 h-20 rounded-3xl bg-civic-500 flex items-center justify-center mx-auto mb-4 shadow-glow">
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Token Issued!</h2>
              <p className="text-[var(--text-muted)] mb-6">Your queue token has been generated</p>

              <div className="bg-slate-50 dark:bg-surface-800 rounded-2xl p-6 mb-6">
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Your Token Number</p>
                <p className="text-5xl font-bold font-mono text-civic-500 mb-4">{issuedToken.token?.tokenNumber}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-[var(--text-muted)]">Position</p><p className="font-bold text-[var(--text-primary)]">#{issuedToken.position}</p></div>
                  <div><p className="text-[var(--text-muted)]">Est. Wait</p><p className="font-bold text-[var(--text-primary)]">{formatEWT(issuedToken.estimatedWaitMinutes)}</p></div>
                </div>
              </div>

              {issuedToken.token?.qrCode && (
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-white rounded-2xl shadow-sm">
                    <QRCode value={issuedToken.token.qrCode} size={140} />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => navigate('/dashboard')} className="flex-1">Dashboard</Button>
                <Button onClick={() => navigate('/track')} className="flex-1">Track Live</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
