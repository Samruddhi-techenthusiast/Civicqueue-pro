import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, Clock, Users, Ticket, Volume2, RefreshCw, AlertTriangle } from 'lucide-react'
import { useAppDispatch, useQueue, useDepartments } from '../../hooks'
import { fetchQueueStatus, applySocketUpdate } from '../../store/slices/queueSlice'
import { fetchDepartments } from '../../store/slices/otherSlices'
import { joinQueueRoom, leaveQueueRoom, getSocket } from '../../services/socket'
import { Card, Select, Spinner, Badge } from '../../components/ui/index.jsx'
import { formatEWT, getQueueBadge } from '../../utils'
import Button from '../../components/ui/Button'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function LiveQueueTracking() {
  const dispatch = useAppDispatch()
  const { list: depts } = useDepartments()
  const { status, loading } = useQueue()
  const [selectedDept, setSelectedDept] = useState('')
  const [connected, setConnected] = useState(false)
  const [tokens, setTokens] = useState([])
  const [lastUpdate, setLastUpdate] = useState(null)
  const [waitingTokens, setWaitingTokens] = useState([])

  useEffect(() => {
    dispatch(fetchDepartments({ limit: 50 }))
  }, [])

  const loadQueue = useCallback(async (deptId) => {
    if (!deptId) return
    const res = await dispatch(fetchQueueStatus(deptId))
    // Fetch real waiting tokens to show on board
    const queueId = res.payload?.queue?._id
    if (queueId) {
      try {
        const { data } = await api.get(
          `/queue/${queueId}/tokens`, { params: { status: 'waiting', limit: 20 } }
        )
        setWaitingTokens(data.data || [])
      } catch { setWaitingTokens([]) }
    } else {
      setWaitingTokens([])
    }
  }, [dispatch])

  useEffect(() => {
    if (!selectedDept) return
    loadQueue(selectedDept)

    // Socket subscription
    const socket = getSocket()
    if (socket) {
      joinQueueRoom(selectedDept)
      setConnected(true)

      const handleUpdate = (data) => {
        dispatch(applySocketUpdate(data))
        setLastUpdate(new Date())
        if (data.type === 'token:called') {
          toast(`Now serving: ${data.token?.tokenNumber}`, { icon: '📢' })
        }
        if (data.type === 'queue:initial' || data.type === 'queue:update') {
          loadQueue(selectedDept)
        }
      }

      socket.on('queue:update', handleUpdate)
      socket.on('queue:initial', (data) => {
        if (data?.queue) dispatch(applySocketUpdate({ type: 'queue:initial', queue: data.queue }))
        setLastUpdate(new Date())
      })

      return () => {
        socket.off('queue:update', handleUpdate)
        socket.off('queue:initial')
        leaveQueueRoom(selectedDept)
        setConnected(false)
      }
    }
  }, [selectedDept])

  const q = status?.queue
  const dept = status?.department

  const statusColor = { open: 'green', paused: 'amber', closed: 'gray' }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="section-title">Live Queue Tracking</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Real-time queue status updates</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedDept && (
            <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${connected ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800' : 'text-slate-500 bg-slate-50 border-slate-200 dark:bg-surface-800 dark:border-surface-700'}`}>
              {connected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {connected ? 'Live' : 'Offline'}
            </div>
          )}
          {selectedDept && (
            <Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => loadQueue(selectedDept)}>Refresh</Button>
          )}
        </div>
      </div>

      {/* Department selector */}
      <Card>
        <Select
          label="Select Department to Track"
          value={selectedDept}
          onChange={e => setSelectedDept(e.target.value)}
          options={[
            { value: '', label: 'Choose a department...' },
            ...depts.map(d => ({ value: d._id, label: `${d.code} — ${d.name}` }))
          ]}
        />
      </Card>

      {!selectedDept && (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-3xl bg-civic-50 dark:bg-civic-950/30 flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-10 h-10 text-civic-300" />
          </div>
          <p className="text-[var(--text-secondary)] font-medium">Select a department to start tracking</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">You'll see live queue updates in real-time</p>
        </div>
      )}

      {selectedDept && loading && (
        <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
      )}

      {selectedDept && !loading && status && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Queue overview */}
            <Card>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">{dept?.name}</h3>
                  <p className="text-sm text-[var(--text-muted)]">{dept?.location || 'Government Office'}</p>
                </div>
                <Badge variant={statusColor[q?.status] || 'gray'} dot={q?.status === 'open' ? '#10b981' : '#94a3b8'}>
                  {q?.status ? q.status.charAt(0).toUpperCase() + q.status.slice(1) : 'Not Opened'}
                </Badge>
              </div>

              {q?.status === 'paused' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm mb-4">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  Queue paused: {q.pauseReason || 'Temporarily unavailable'}
                </motion.div>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Now Serving', value: q?.nowServingNumber || '—', color: 'text-civic-500', bg: 'bg-civic-50 dark:bg-civic-950/30' },
                  { label: 'Waiting', value: status.waitingCount ?? '—', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
                  { label: 'Served Today', value: q?.totalServed ?? '—', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
                  { label: 'Est. Wait (new)', value: formatEWT(status.estimatedWaitForNew), color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/30' },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
                    <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {lastUpdate && (
                <p className="text-xs text-[var(--text-muted)] mt-4 text-right">
                  Last updated: {lastUpdate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              )}
            </Card>

            {/* Live token list */}
            {q && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[var(--text-primary)]">Queue Display Board</h3>
                  {connected && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live
                    </span>
                  )}
                </div>

                <AnimatePresence>
                  <div className="space-y-2">
                    {/* Now serving highlight */}
                    {q.nowServingNumber && (
                      <motion.div key="serving" layout
                        className="flex items-center justify-between p-4 rounded-2xl bg-civic-500 text-white shadow-glow">
                        <div className="flex items-center gap-3">
                          <Volume2 className="w-5 h-5 animate-pulse" />
                          <span className="font-mono text-xl font-bold">{q.nowServingNumber}</span>
                        </div>
                        <span className="text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full">Now Serving</span>
                      </motion.div>
                    )}

                    {/* Waiting queue */}
                    {status.waitingCount > 0 ? (
                      <div className="mt-2 space-y-1.5">
                        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider px-1">Waiting</p>
                        {(waitingTokens.length > 0
                          ? waitingTokens.slice(0, 8)
                          : [...Array(Math.min(status.waitingCount, 8))].map((_, i) => ({ _id: i, tokenNumber: '—', estimatedWaitMinutes: (i+1) * (status.avgServiceTimeMinutes || 5) }))
                        ).map((token, i) => (
                          <motion.div key={token._id || i}
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-surface-800 border border-[var(--border)]">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-surface-700 flex items-center justify-center text-xs font-medium text-[var(--text-muted)]">{i + 1}</span>
                              <span className="text-sm font-mono font-medium text-[var(--text-secondary)]">{token.tokenNumber}</span>
                              {token.priority && token.priority !== 'normal' && (
                                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${token.priority === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>{token.priority}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                              <Clock className="w-3.5 h-3.5" />
                              {formatEWT(token.estimatedWaitMinutes || (i + 1) * (status.avgServiceTimeMinutes || 5))}
                            </div>
                          </motion.div>
                        ))}
                        {status.waitingCount > 8 && (
                          <p className="text-xs text-center text-[var(--text-muted)] py-2">+{status.waitingCount - 8} more in queue</p>
                        )}
                      </div>
                    ) : (
                      !q.nowServingNumber && (
                        <div className="text-center py-8 text-[var(--text-muted)]">
                          <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">Queue is empty</p>
                        </div>
                      )
                    )}
                  </div>
                </AnimatePresence>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
