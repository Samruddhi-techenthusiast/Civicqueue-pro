import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Ticket, Clock, Calendar, ArrowRight, QrCode, Bell, MapPin } from 'lucide-react'
import { useAppDispatch, useAuth, useQueue } from '../../hooks'
import { fetchMyTokens } from '../../store/slices/queueSlice'
import { StatCard, Card } from '../../components/ui/index.jsx'
import { formatDate, formatEWT, getTokenBadge } from '../../utils'
import api from '../../services/api'

export default function CitizenDashboard() {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const { myTokens } = useQueue()
  const [appointments, setAppointments] = useState([])
  const [depts, setDepts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        dispatch(fetchMyTokens({ limit: 5 }))
        const [apptRes, deptRes] = await Promise.all([
          api.get('/appointments/my', { params: { limit: 3 } }),
          api.get('/departments', { params: { limit: 6 } }),
        ])
        setAppointments(apptRes.data.data || [])
        setDepts(deptRes.data.data || [])
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const activeToken = myTokens.find(t => ['waiting','serving'].includes(t.status))
  const todayAppts = appointments.filter(a => a.date === new Date().toISOString().slice(0,10))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="section-title">Good {greeting()}, {user?.name?.split(' ')[0]} </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <Link to="/queue" className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <Ticket className="w-4 h-4" /> Get Token
        </Link>
      </div>

      {/* Active token banner */}
      {activeToken && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="card p-5 border-civic-200 dark:border-civic-800 bg-civic-50 dark:bg-civic-950/30">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-civic-500 flex items-center justify-center shadow-glow">
                <span className="text-white font-bold text-lg font-mono">{activeToken.tokenNumber?.split('-')[1]}</span>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wide">Active Token</p>
                <p className="text-xl font-bold text-[var(--text-primary)] font-mono">{activeToken.tokenNumber}</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {activeToken.status === 'serving' ? ' Your turn now! Go to the counter.' : `Position #${activeToken.position} · Wait ${formatEWT(activeToken.estimatedWaitMinutes)}`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/track" className="btn-secondary text-sm flex items-center gap-1.5 py-2">
                <QrCode className="w-4 h-4" /> Track
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tokens This Month" value={myTokens.length} icon={Ticket} iconColor="blue" loading={loading} />
        <StatCard title="Served" value={myTokens.filter(t=>t.status==='served').length} icon={Clock} iconColor="green" loading={loading} />
        <StatCard title="Upcoming Appts" value={appointments.filter(a=>['scheduled','confirmed'].includes(a.status)).length} icon={Calendar} iconColor="purple" loading={loading} />
        <StatCard title="Departments" value={depts.length} icon={MapPin} iconColor="amber" loading={loading} />
      </div>

      {/* Departments grid */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[var(--text-primary)]">Departments</h3>
          <Link to="/queue" className="text-sm text-civic-500 hover:text-civic-600 flex items-center gap-1">Browse all <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {loading ? [...Array(6)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />) :
            depts.map((d, i) => (
              <motion.div key={d._id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/queue?dept=${d._id}`}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--border)] hover:border-civic-300 dark:hover:border-civic-700 hover:bg-civic-50 dark:hover:bg-civic-950/20 transition-all group text-center">
                  <div className="w-9 h-9 rounded-xl bg-civic-100 dark:bg-civic-950/40 flex items-center justify-center group-hover:bg-civic-200 dark:group-hover:bg-civic-950/60 transition-colors">
                    <span className="text-xs font-bold text-civic-600 dark:text-civic-400">{d.code}</span>
                  </div>
                  <p className="text-xs font-medium text-[var(--text-secondary)] leading-tight line-clamp-2">{d.name}</p>
                </Link>
              </motion.div>
            ))}
        </div>
      </Card>

      {/* Recent tokens */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[var(--text-primary)]">Recent Tokens</h3>
          <Link to="/appointments" className="text-sm text-civic-500 hover:text-civic-600 flex items-center gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
        {loading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div> :
          myTokens.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-muted)]">
              <Ticket className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No tokens yet — <Link to="/queue" className="text-civic-500">get your first token</Link></p>
            </div>
          ) : (
            <div className="space-y-2">
              {myTokens.slice(0, 5).map(t => (
                <div key={t._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-surface-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-[var(--text-primary)]">{t.tokenNumber}</span>
                    <span className="text-xs text-[var(--text-muted)]">{t.department?.name || 'Department'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[var(--text-muted)]">{formatDate(t.createdAt)}</span>
                    <span className={getTokenBadge(t.status)}>{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
      </Card>
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
}
