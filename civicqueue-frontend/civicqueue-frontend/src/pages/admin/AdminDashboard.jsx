import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Building2, Ticket, CheckCircle, TrendingUp, Clock, Activity, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatCard, Card } from '../../components/ui/index.jsx'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../../services/api'
import { formatDate } from '../../utils'

const COLORS = ['#3366ff', '#10b981', '#f59e0b', '#f43f5e', '#7c3aed']

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null)
  const [weeklyData,   setWeeklyData]   = useState([])  
  const [statusData,   setStatusData]   = useState([]) 
  const [loading, setLoading] = useState(true)
  const [recentUsers, setRecentUsers] = useState([])
  const [depts, setDepts] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const [overRes, weeklyRes, usersRes, deptsRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/weekly'),
          api.get('/users', { params: { limit: 5, sort: '-createdAt' } }),
          api.get('/departments', { params: { limit: 6 } }),
        ])
        setOverview(overRes.data.data)
        setWeeklyData(weeklyRes.data.data?.weeklyTokens || [])

        const STATUS_COLORS = {
          waiting:   '#f59e0b',
          serving:   '#3366ff',
          served:    '#10b981',
          cancelled: '#f43f5e',
          no_show:   '#7c3aed',
        }
        const breakdown = weeklyRes.data.data?.statusBreakdown || []
        setStatusData(breakdown.map(s => ({
          name: s._id?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
          value: s.count,
          color: STATUS_COLORS[s._id] || '#94a3b8',
        })))
        setRecentUsers(usersRes.data.data || [])
        setDepts(deptsRes.data.data || [])
      } finally { setLoading(false) }
    }
    load()
  }, [])

  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="section-title">Admin Dashboard</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/departments" className="btn-secondary text-sm flex items-center gap-1.5"><Building2 className="w-4 h-4" /> Manage Depts</Link>
          <Link to="/admin/analytics" className="btn-primary text-sm flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> Analytics</Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={overview?.totalUsers ?? '—'} icon={Users} iconColor="blue" loading={loading} />
        <StatCard title="Active Queues" value={overview?.activeQueues ?? '—'} icon={Activity} iconColor="green" loading={loading} />
        <StatCard title="Today's Tokens" value={overview?.todayTokens ?? '—'} icon={Ticket} iconColor="amber" loading={loading} />
        <StatCard title="Served Today" value={overview?.todayServed ?? '—'} icon={CheckCircle} iconColor="purple" loading={loading} />
      </div>

      {/* Charts row */}
    
<div className="grid lg:grid-cols-3 gap-4">
        {/* Weekly chart — now uses REAL data from weeklyData state */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold">Weekly Token Activity</h3>
            <span className="text-xs text-slate-500">Last 7 days — live data</span>
          </div>
          {weeklyData.length === 0 ? (
            <div className="flex items-center justify-center h-56 text-slate-400 text-sm">
              No token data for the past 7 days
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="gIssued" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3366ff" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3366ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gServed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }}
                       axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }}
                       axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                {/* 'issued' and 'served' are real fields from the aggregation */}
                <Area type="monotone" dataKey="issued" stroke="#3366ff"
                      strokeWidth={2} fill="url(#gIssued)" name="Issued" />
                <Area type="monotone" dataKey="served" stroke="#10b981"
                      strokeWidth={2} fill="url(#gServed)" name="Served" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Today's status — real data */}
        <div className="card p-6">
          <h3 className="font-bold mb-5">Today's Status</h3>
          {statusData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
              No tokens today
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%"
                       innerRadius={45} outerRadius={75}
                       paddingAngle={3} dataKey="value">
                    {statusData.map((s, i) => (
                      <Cell key={i} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 12, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {statusData.map(s => (
                  <div key={s.name}
                    className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full"
                            style={{ background: s.color }} />
                      <span className="text-slate-600">{s.name}</span>
                    </div>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent users */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--text-primary)]">Recent Users</h3>
            <Link to="/admin/users" className="text-sm text-civic-500 hover:text-civic-600 flex items-center gap-1">View all <ArrowUpRight className="w-3.5 h-3.5" /></Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
          ) : (
            <div className="space-y-2">
              {recentUsers.map((u, i) => (
                <motion.div key={u._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-surface-800 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-civic-100 dark:bg-civic-950/40 flex items-center justify-center text-civic-600 dark:text-civic-400 font-bold text-sm flex-shrink-0">
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{u.name}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{u.email}</p>
                  </div>
                  <span className={`badge-${u.role === 'admin' || u.role === 'super_admin' ? 'purple' : u.role === 'staff' ? 'blue' : 'gray'} capitalize`}>{u.role}</span>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Department status */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--text-primary)]">Departments</h3>
            <Link to="/admin/departments" className="text-sm text-civic-500 hover:text-civic-600 flex items-center gap-1">Manage <ArrowUpRight className="w-3.5 h-3.5" /></Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
          ) : (
            <div className="space-y-2">
              {depts.map((d, i) => (
                <motion.div key={d._id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-surface-800 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-civic-100 dark:bg-civic-950/40 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-civic-600 dark:text-civic-400">{d.code}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{d.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{d.activeCounters} counter{d.activeCounters !== 1 ? 's' : ''} · ~{d.avgServiceTimeMinutes}m avg</p>
                  </div>
                  <span className={d.isActive ? 'badge-green' : 'badge-gray'}>{d.isActive ? 'Active' : 'Inactive'}</span>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
