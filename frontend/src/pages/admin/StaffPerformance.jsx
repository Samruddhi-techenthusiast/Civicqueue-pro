import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, Clock, Award, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card } from '../../components/ui/index.jsx'
import api from '../../services/api'
import { formatDate } from '../../utils'
import toast from 'react-hot-toast'

const COLORS = ['#3366ff', '#10b981', '#f59e0b', '#f43f5e', '#7c3aed', '#06b6d4']

export default function StaffPerformance() {
  const [depts, setDepts] = useState([])
  const [selectedDept, setSelectedDept] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [staffData, setStaffData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/departments', { params: { limit: 50 } })
      .then(({ data }) => {
        const active = (data.data || []).filter(d => d.isActive)
        setDepts(active)
        if (active.length) setSelectedDept(active[0]._id)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedDept) return
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await api.get(
          `/analytics/department/${selectedDept}/staff`,
          { params: { date } }
        )
        setStaffData(data.data?.staff || [])
      } catch (err) {
        toast.error('Failed to load staff data')
      } finally { setLoading(false) }
    }
    load()
  }, [selectedDept, date])

  const topPerformer = staffData[0]
  const totalServed = staffData.reduce((sum, s) => sum + s.tokensServed, 0)
  const avgHandling = staffData.length
    ? (staffData.reduce((sum, s) => sum + (s.avgHandlingMinutes || 0), 0) / staffData.length).toFixed(1)
    : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="section-title">Staff Performance</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Token handling metrics per staff member
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            className="input text-sm"
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
          >
            {depts.map(d => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
          <input
            type="date"
            className="input text-sm"
            value={date}
            max={new Date().toISOString().slice(0, 10)}
            onChange={e => setDate(e.target.value)}
          />
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Staff Active', value: staffData.length, icon: Users, color: 'blue' },
          { label: 'Total Served', value: totalServed, icon: TrendingUp, color: 'green' },
          { label: 'Avg Handling', value: `${avgHandling}m`, icon: Clock, color: 'amber' },
          { label: 'Top Performer', value: topPerformer?.name?.split(' ')[0] || '—', icon: Award, color: 'purple' },
        ].map(s => (
          <Card key={s.label}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-${s.color}-100 dark:bg-${s.color}-950/40 flex items-center justify-center flex-shrink-0`}>
                <s.icon className={`w-5 h-5 text-${s.color}-500`} />
              </div>
              <div>
                <p className="text-xl font-bold text-[var(--text-primary)]">
                  {loading ? '—' : s.value}
                </p>
                <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <Card>
          <h3 className="font-bold mb-5">Tokens Served per Staff</h3>
          {loading ? (
            <div className="h-64 skeleton rounded-xl" />
          ) : staffData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-[var(--text-muted)] text-sm">
              No data for this date
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={staffData} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false} tickLine={false}
                  tickFormatter={n => n.split(' ')[0]}
                />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, fontSize: 12, border: '1px solid #e2e8f0' }}
                  formatter={(v) => [v, 'Tokens Served']}
                />
                <Bar dataKey="tokensServed" radius={[6, 6, 0, 0]}>
                  {staffData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Avg handling time chart */}
        <Card>
          <h3 className="font-bold mb-5">Avg Handling Time (min)</h3>
          {loading ? (
            <div className="h-64 skeleton rounded-xl" />
          ) : staffData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-[var(--text-muted)] text-sm">
              No data for this date
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={staffData} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false} tickLine={false}
                  tickFormatter={n => n.split(' ')[0]}
                />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, fontSize: 12 }}
                  formatter={(v) => [`${v} min`, 'Avg Handling']}
                />
                <Bar dataKey="avgHandlingMinutes" radius={[6, 6, 0, 0]} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Detailed table */}
      <Card>
        <h3 className="font-bold mb-4">Staff Leaderboard — {formatDate(date)}</h3>
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
          </div>
        ) : staffData.length === 0 ? (
          <div className="text-center py-10 text-[var(--text-muted)]">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No staff activity recorded for this date</p>
          </div>
        ) : (
          <div className="space-y-2">
            {staffData.map((s, i) => (
              <motion.div
                key={s.staffId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-surface-800 transition-colors"
              >
                {/* Rank badge */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  i === 0 ? 'bg-amber-400 text-white' :
                  i === 1 ? 'bg-slate-300 text-slate-700' :
                  i === 2 ? 'bg-orange-300 text-white' :
                             'bg-slate-100 text-slate-500'
                }`}>
                  {i + 1}
                </div>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-civic-100 dark:bg-civic-950/40 flex items-center justify-center text-civic-600 dark:text-civic-400 font-bold text-sm flex-shrink-0">
                  {s.name?.[0]?.toUpperCase() || '?'}
                </div>

                {/* Name + email */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{s.name}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{s.email}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm flex-shrink-0">
                  <div className="text-center">
                    <p className="font-bold text-[var(--text-primary)]">{s.tokensServed}</p>
                    <p className="text-xs text-[var(--text-muted)]">Served</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-[var(--text-primary)]">
                      {s.avgHandlingMinutes != null ? `${s.avgHandlingMinutes}m` : '—'}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">Avg time</p>
                  </div>
                </div>

                {/* Progress bar for relative comparison */}
                <div className="w-24 hidden sm:block">
                  <div className="h-2 bg-slate-100 dark:bg-surface-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${totalServed > 0 ? (s.tokensServed / totalServed) * 100 : 0}%`,
                        background: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 text-right">
                    {totalServed > 0 ? Math.round((s.tokensServed / totalServed) * 100) : 0}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
