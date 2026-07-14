// src/pages/admin/StaffDashboard.jsx — Clean modern SaaS-style redesign

import { useState, useCallback } from 'react'
import {
  Play, Pause, Square, Volume2, CheckCircle,
  AlertTriangle, X, Check, Clock, Users,
  SkipForward, RotateCcw, ChevronRight,
  Hash, Timer, TrendingUp, Activity
} from 'lucide-react'
import { useAuth } from '../../hooks'
import { useQueueData } from '../../hooks/useQueueData'
import toast from 'react-hot-toast'

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    waiting:   'bg-amber-100 text-amber-700',
    serving:   'bg-blue-100 text-blue-700',
    served:    'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
    no_show:   'bg-slate-100 text-slate-600',
  }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[status] || map.waiting}`}>
      {status === 'no_show' ? 'No Show' : status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  )
}

// ── Priority chip ─────────────────────────────────────────────────────────────
const PriorityChip = ({ priority }) => {
  if (!priority || priority === 'normal') return null
  const map = { high: 'bg-amber-100 text-amber-700', urgent: 'bg-red-100 text-red-700' }
  return <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${map[priority]}`}>{priority}</span>
}

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color = 'slate', loading }) => {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    amber:  'bg-amber-50 text-amber-600',
    green:  'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    slate:  'bg-slate-100 text-slate-500',
  }
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-[var(--text-primary)]">
          {loading ? <span className="inline-block w-6 h-5 skeleton rounded" /> : value}
        </p>
        <p className="text-xs text-[var(--text-muted)] truncate">{label}</p>
        {sub && <p className="text-xs text-[var(--text-muted)] font-medium">{sub}</p>}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function StaffDashboard() {
  const { user } = useAuth()
  const deptId = user?.department

  const { queueStatus, tokens, appointments, loading, error, actions } =
    useQueueData(deptId, 4000)

  const [counter, setCounter]             = useState('Counter 1')
  const [pauseReason, setPauseReason]     = useState('')
  const [showPause, setShowPause]         = useState(false)
  const [rejectModal, setRejectModal]     = useState({ open: false, id: null })
  const [rejectReason, setRejectReason]   = useState('')
  const [actionLoading, setActionLoading] = useState(null)

  const handleAction = useCallback(async (label, fn) => {
    setActionLoading(label)
    try {
      await fn()
      toast.success(label)
    } catch (err) {
      toast.error(err?.response?.data?.message || `${label} failed`)
    } finally {
      setActionLoading(null)
    }
  }, [])

  // ── Guard: no department ──────────────────────────────────────────────────
  if (!deptId) return (
    <div className="flex items-center justify-center h-72">
      <div className="text-center">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <p className="font-semibold text-[var(--text-primary)]">No department assigned</p>
        <p className="text-sm text-[var(--text-muted)] mt-1">Contact your admin to be assigned a department</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="p-5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
      Failed to load: {error}. Auto-retrying…
    </div>
  )

  const q = queueStatus?.queue
  const dept = queueStatus?.department
  const stats = {
    waiting:  queueStatus?.waitingCount   ?? 0,
    serving:  queueStatus?.servingCount   ?? 0,
    served:   q?.totalServed              ?? 0,
    ewt:      queueStatus?.estimatedWaitForNew ?? 0,
  }

  const servingToken  = tokens.find(t => t.status === 'serving')
  const waitingTokens = tokens
    .filter(t => t.status === 'waiting')
    .sort((a, b) => (b.priorityOrder - a.priorityOrder) || (a.serial - b.serial))

  const pendingAppts   = appointments.filter(a => a.status === 'pending_approval')
  const scheduledAppts = appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status))

  // ── Queue status colour ───────────────────────────────────────────────────
  const qStatusStyle = q?.status === 'open'
    ? { bar: 'bg-emerald-500', ring: 'ring-emerald-200', bg: 'bg-emerald-50 border-emerald-200' }
    : q?.status === 'paused'
    ? { bar: 'bg-amber-500',   ring: 'ring-amber-200',   bg: 'bg-amber-50 border-amber-200' }
    : { bar: 'bg-slate-400',   ring: 'ring-slate-200',   bg: 'bg-slate-50 border-slate-200' }

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── 1. Queue control header ──────────────────────────────────────── */}
      <div className={`rounded-2xl border p-5 ${qStatusStyle.bg}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">

          {/* Left: status + dept name */}
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${qStatusStyle.bar} ${
              q?.status === 'open' ? 'animate-pulse' : ''
            }`} />
            <div>
              <p className="font-bold text-base text-[var(--text-primary)]">
                {dept?.name || 'Department Queue'}
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                {q?.status === 'open'   ? 'Queue is open' :
                 q?.status === 'paused' ? `Paused — ${q.pauseReason || 'No reason given'}` :
                 q?.status === 'closed' ? 'Queue is closed' :
                 'Queue not opened today'}
                {q?.nowServingNumber && (
                  <span className="ml-2 font-mono font-bold text-blue-600">
                    · Serving {q.nowServingNumber}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {(!q || q.status === 'closed') && (
              <button
                onClick={() => handleAction('Queue opened', actions.openQueue)}
                disabled={actionLoading === 'Queue opened'}
                className="btn-primary flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {actionLoading === 'Queue opened' ? 'Opening…' : 'Open Queue'}
              </button>
            )}

            {q?.status === 'open' && (
              <>
                <input
                  className="input w-32 text-sm h-9 px-3"
                  value={counter}
                  onChange={e => setCounter(e.target.value)}
                  placeholder="Counter"
                />
                <button
                  onClick={() => handleAction('Token called', () => actions.callNext(counter))}
                  disabled={stats.waiting === 0 || actionLoading === 'Token called'}
                  className="btn-primary flex items-center gap-2 h-9"
                >
                  <Volume2 className="w-4 h-4" />
                  Call Next
                  {stats.waiting > 0 && (
                    <span className="ml-1 bg-white/30 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {stats.waiting}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setShowPause(true)}
                  className="btn-secondary flex items-center gap-2 h-9"
                >
                  <Pause className="w-4 h-4" /> Pause
                </button>
                <button
                  onClick={() => handleAction('Queue closed', () => actions.updateStatus('closed'))}
                  className="btn-danger flex items-center gap-2 h-9"
                >
                  <Square className="w-4 h-4" /> Close
                </button>
              </>
            )}

            {q?.status === 'paused' && (
              <>
                <button
                  onClick={() => handleAction('Queue resumed', () => actions.updateStatus('open'))}
                  className="btn-primary flex items-center gap-2"
                >
                  <Play className="w-4 h-4" /> Resume
                </button>
                <button
                  onClick={() => handleAction('Queue closed', () => actions.updateStatus('closed'))}
                  className="btn-danger flex items-center gap-2"
                >
                  <Square className="w-4 h-4" /> Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. Stats row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}      label="Waiting"        value={stats.waiting}    color="amber"  loading={loading} />
        <StatCard icon={Activity}   label="Now Serving"    value={stats.serving}    color="blue"   loading={loading} />
        <StatCard icon={CheckCircle} label="Served Today"  value={stats.served}     color="green"  loading={loading} />
        <StatCard icon={Timer}      label="Avg Wait"
          value={stats.ewt > 0 ? `~${stats.ewt}m` : '0m'}
          sub={`Avg ${q?.avgServiceTimeMinutes || dept?.avgServiceTimeMinutes || 5} min/token`}
          color="purple" loading={loading} />
      </div>

      {/* ── 3. Currently serving — hero card ─────────────────────────────── */}
      {servingToken && (
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 shadow-lg">
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 animate-pulse" /> Now Serving
          </p>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-4xl font-black font-mono leading-none mb-1">
                {servingToken.tokenNumber}
              </p>
              <p className="text-blue-100 text-sm">
                {servingToken.citizenName || 'Walk-in'} · {servingToken.serviceType || 'General'}
                {servingToken.counter ? <span className="ml-1 font-semibold">→ {servingToken.counter}</span> : ''}
              </p>
              {servingToken.notes && (
                <p className="text-blue-200 text-xs mt-1">📝 {servingToken.notes}</p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleAction('Token served', () => actions.markServed(servingToken._id))}
                disabled={actionLoading === 'Token served'}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-blue-700
                           font-semibold text-sm hover:bg-blue-50 transition-colors shadow"
              >
                <CheckCircle className="w-4 h-4" />
                {actionLoading === 'Token served' ? 'Saving…' : 'Mark Served'}
              </button>
              <button
                onClick={() => handleAction('Token recalled', () => actions.recallToken(servingToken._id, counter))}
                disabled={actionLoading === 'Token recalled'}
                title="Re-announce this token to the citizen"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500/50 text-white
                           font-semibold text-sm hover:bg-blue-500/70 transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Recall
              </button>
              <button
                onClick={() => handleAction('Token skipped', () => actions.skipToken(servingToken._id, 'No show'))}
                disabled={actionLoading === 'Token skipped'}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/70 text-white
                           font-semibold text-sm hover:bg-red-500/90 transition-colors"
              >
                <SkipForward className="w-4 h-4" /> No Show
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Main grid: queue table + appointments ──────────────────────── */}
      <div className="grid lg:grid-cols-5 gap-5">

        {/* Queue table — 3 cols wide */}
        <div className="lg:col-span-3 card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <h3 className="font-bold">Queue</h3>
            <span className="text-xs text-[var(--text-muted)] bg-slate-100 dark:bg-surface-700
                             px-2 py-1 rounded-full font-medium">
              {waitingTokens.length} waiting
            </span>
          </div>

          {waitingTokens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)]">
              <Hash className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">Queue is empty</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)] max-h-96 overflow-y-auto">
              {waitingTokens.map((token, i) => (
                <div key={token._id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50
                             dark:hover:bg-surface-800 transition-colors">

                  {/* Position */}
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs
                                   font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {i + 1}
                  </span>

                  {/* Token + name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[var(--text-primary)]">
                        {token.tokenNumber}
                      </span>
                      <PriorityChip priority={token.priority} />
                    </div>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {token.citizenName || 'Walk-in'}
                      {token.serviceType && token.serviceType !== 'General'
                        ? ` · ${token.serviceType}` : ''}
                    </p>
                  </div>

                  {/* EWT */}
                  <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    ~{token.estimatedWaitMinutes ?? 0}m
                  </div>

                  {/* Status */}
                  <StatusBadge status={token.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Appointments — 2 cols wide */}
        <div className="lg:col-span-2 space-y-4">

          {/* Pending approvals */}
          {pendingAppts.length > 0 && (
            <div className="card p-0 overflow-hidden border-amber-200">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-200 bg-amber-50">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="font-bold text-sm text-amber-800">
                  Approvals ({pendingAppts.length})
                </h3>
              </div>
              <div className="divide-y divide-[var(--border)] max-h-52 overflow-y-auto">
                {pendingAppts.map(appt => (
                  <div key={appt._id} className="px-4 py-3">
                    <p className="font-medium text-sm truncate">{appt.citizen?.name}</p>
                    <p className="text-xs text-[var(--text-muted)] mb-2">
                      {appt.timeSlot?.start} · {appt.serviceType}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction('Appointment approved',
                          () => actions.approveAppointment(appt._id))}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg
                                   bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600"
                      >
                        <Check className="w-3 h-3" /> Approve
                      </button>
                      <button
                        onClick={() => setRejectModal({ open: true, id: appt._id })}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg
                                   bg-red-500 text-white text-xs font-semibold hover:bg-red-600"
                      >
                        <X className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Today's scheduled appointments */}
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
              <h3 className="font-bold text-sm">Today's Appointments</h3>
              <span className="text-xs text-[var(--text-muted)]">{scheduledAppts.length}</span>
            </div>
            {scheduledAppts.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--text-muted)]">
                No appointments today
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)] max-h-64 overflow-y-auto">
                {scheduledAppts.map(appt => (
                  <div key={appt._id}
                    className="flex items-center justify-between px-4 py-3 gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{appt.citizen?.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {appt.timeSlot?.start}
                      </p>
                    </div>
                    {appt.status !== 'checked_in' ? (
                      <button
                        onClick={() => handleAction('Checked in',
                          () => actions.checkInAppointment(appt._id))}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500
                                   text-white text-xs font-semibold hover:bg-blue-600 flex-shrink-0"
                      >
                        <ChevronRight className="w-3 h-3" /> Check In
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-100
                                       px-2 py-1 rounded-full flex-shrink-0">
                        ✓ Checked In
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 5. Pause modal ───────────────────────────────────────────────── */}
      {showPause && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-lg mb-1">Pause Queue</h3>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              New tokens won't be issued while queue is paused.
            </p>
            <input
              className="input w-full mb-4"
              placeholder="Reason (e.g. Lunch break, System maintenance)"
              value={pauseReason}
              onChange={e => setPauseReason(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowPause(false)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={async () => {
                  await handleAction('Queue paused', () => actions.updateStatus('paused', pauseReason))
                  setShowPause(false)
                  setPauseReason('')
                }}
                className="btn-primary flex-1"
              >
                Confirm Pause
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Reject modal ──────────────────────────────────────────────── */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-lg mb-4">Reject Appointment</h3>
            <input
              className="input w-full mb-4"
              placeholder="Reason for rejection (required)"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => setRejectModal({ open: false, id: null })} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!rejectReason.trim()) { toast.error('Please provide a reason'); return }
                  await handleAction('Appointment rejected',
                    () => actions.rejectAppointment(rejectModal.id, rejectReason))
                  setRejectModal({ open: false, id: null })
                  setRejectReason('')
                }}
                className="btn-danger flex-1"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
