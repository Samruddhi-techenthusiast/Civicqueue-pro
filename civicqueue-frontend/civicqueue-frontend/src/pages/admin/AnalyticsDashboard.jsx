// src/pages/admin/AnalyticsDashboard.jsx — Full analytics with peak hours, no-show rate, dept comparison

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3, TrendingUp, Clock, Users, AlertTriangle,
  CheckCircle, XCircle, Building2, Calendar
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
  LineChart, Line
} from 'recharts'
import { Card, StatCard, Select } from '../../components/ui/index.jsx'
import { Spinner } from '../../components/ui/index.jsx'
import api from '../../services/api'
import { useAppDispatch, useDepartments } from '../../hooks'
import { fetchDepartments } from '../../store/slices/otherSlices'

const COLORS = ['#3366ff', '#10b981', '#f59e0b', '#f43f5e', '#7c3aed', '#06b6d4', '#ec4899', '#f97316']

const STATUS_COLORS = {
  served: '#10b981', waiting: '#f59e0b', serving: '#3366ff',
  cancelled: '#f43f5e', no_show: '#7c3aed',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-surface-900 border border-[var(--border)] rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold mb-2 text-[var(--text-primary)]">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-[var(--text-secondary)]">{p.name}:</span>
          <span className="font-bold text-[var(--text-primary)]">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsDashboard() {
  const dispatch = useAppDispatch()
  const { list: depts } = useDepartments()
  const [selectedDept, setSelectedDept] = useState('')
  const [deptData, setDeptData]         = useState(null)
  const [deptCompare, setDeptCompare]   = useState([])
  const [loading, setLoading]           = useState(false)
  const [compareLoading, setCompareLoading] = useState(false)
  const [range, setRange]               = useState('30')

  useEffect(() => {
    dispatch(fetchDepartments({ limit: 50 }))
  }, [])

  // Load dept performance comparison (admin overview)
  useEffect(() => {
    const load = async () => {
      setCompareLoading(true)
      try {
        const { data } = await api.get('/analytics/departments/performance', { params: { days: range } })
        setDeptCompare(data.data?.departments || [])
      } catch { } finally { setCompareLoading(false) }
    }
    load()
  }, [range])

  // Load per-department detailed analytics
  const loadDeptAnalytics = useCallback(async (deptId, days) => {
    if (!deptId) { setDeptData(null); return }
    setLoading(true)
    try {
      const to   = new Date().toISOString().slice(0, 10)
      const from = new Date(Date.now() - parseInt(days) * 86400000).toISOString().slice(0, 10)
      const { data } = await api.get(`/analytics/department/${deptId}`, { params: { from, to } })
      setDeptData(data.data)
    } catch { } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    loadDeptAnalytics(selectedDept, range)
  }, [selectedDept, range])

  // ── Derived data ───────────────────────────────────────────────────────────
  const summary = deptData?.summary || {}
  const hourly  = (deptData?.hourlyDistribution || []).map(h => ({
    hour: `${h._id}:00`,
    count: h.count,
  }))

  const noShowCount   = deptData?.summary?.tokenBreakdown?.find(s => s._id === 'no_show')?.count || 0
  const cancelCount   = deptData?.summary?.tokenBreakdown?.find(s => s._id === 'cancelled')?.count || 0
  const noShowRate    = summary.totalTokens ? Math.round((noShowCount / summary.totalTokens) * 100) : 0
  const cancelRate    = summary.totalTokens ? Math.round((cancelCount / summary.totalTokens) * 100) : 0

  const tokenBreakdown = (summary.tokenBreakdown || []).map(s => ({
    name: s._id === 'no_show' ? 'No Show' : s._id?.charAt(0).toUpperCase() + s._id?.slice(1),
    value: s.count,
    color: STATUS_COLORS[s._id] || '#94a3b8',
  }))

  const peakHour = hourly.length
    ? hourly.reduce((a, b) => a.count > b.count ? a : b)
    : null

  const dailyTrend = (deptData?.dailyTrend || []).map(d => ({
    date: d._id?.slice(5), // MM-DD
    served: d.totalServed,
    cancelled: d.totalCancelled,
    avgTime: Math.round(d.avgServiceTime || 0),
  }))

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="section-title">Analytics</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">System-wide and per-department insights</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Select
            value={range}
            onChange={e => setRange(e.target.value)}
            options={[
              { value: '7',  label: 'Last 7 days' },
              { value: '30', label: 'Last 30 days' },
              { value: '90', label: 'Last 90 days' },
            ]}
            className="w-36"
          />
          <Select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            options={[
              { value: '', label: 'All Departments' },
              ...depts.map(d => ({ value: d._id, label: `${d.code} — ${d.name}` })),
            ]}
            className="w-52"
          />
        </div>
      </div>

      {/* ── Dept performance comparison table (always visible) ─────────── */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Department Performance</h3>
          {compareLoading && <Spinner size="sm" />}
        </div>
        {deptCompare.length === 0 ? (
          <div className="text-center py-8 text-sm text-[var(--text-muted)]">No data for this period</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-[var(--text-muted)] border-b border-[var(--border)]">
                  <th className="text-left py-2 font-semibold">Department</th>
                  <th className="text-right py-2 font-semibold">Total</th>
                  <th className="text-right py-2 font-semibold">Served</th>
                  <th className="text-right py-2 font-semibold">Service Rate</th>
                  <th className="text-right py-2 font-semibold">No-Show Rate</th>
                  <th className="text-right py-2 font-semibold">Avg Wait</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {deptCompare.map((d, i) => (
                  <motion.tr key={d.code} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-slate-50 dark:hover:bg-surface-800 transition-colors cursor-pointer"
                    onClick={() => {
                      const dept = depts.find(x => x.code === d.code)
                      if (dept) setSelectedDept(dept._id)
                    }}>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-civic-600 dark:text-civic-400 bg-civic-50 dark:bg-civic-950/30 px-1.5 py-0.5 rounded">
                          {d.code}
                        </span>
                        <span className="font-medium text-[var(--text-primary)]">{d.department}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right font-medium">{d.total}</td>
                    <td className="py-3 text-right font-medium text-emerald-600">{d.served}</td>
                    <td className="py-3 text-right">
                      <span className={`font-bold ${d.serviceRate >= 80 ? 'text-emerald-600' : d.serviceRate >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                        {d.serviceRate}%
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className={`font-bold ${d.noShowRate > 20 ? 'text-red-500' : d.noShowRate > 10 ? 'text-amber-600' : 'text-[var(--text-secondary)]'}`}>
                        {d.noShowRate}%
                      </span>
                    </td>
                    <td className="py-3 text-right text-[var(--text-secondary)]">{d.avgWaitMinutes}m</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Per-dept deep dive (only when dept selected) ────────────────── */}
      {selectedDept && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
          ) : deptData ? (
            <>
              {/* KPI row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Tokens"   value={summary.totalTokens  ?? '—'} icon={BarChart3}    iconColor="blue"   />
                <StatCard title="Served"          value={summary.totalServed  ?? '—'} icon={CheckCircle}  iconColor="green"  />
                <StatCard title="Avg Wait"        value={summary.avgWaitMinutes != null ? `${summary.avgWaitMinutes}m` : '—'} icon={Clock} iconColor="amber" />
                <StatCard title="Service Rate"    value={summary.serviceRate  ?? '—'} icon={TrendingUp}   iconColor="purple" />
              </div>

              {/* No-show + cancel KPIs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="card p-4 flex items-center gap-4 border-red-100 dark:border-red-900/30">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-500">{noShowRate}%</p>
                    <p className="text-xs text-[var(--text-muted)]">No-show Rate ({noShowCount} tokens)</p>
                  </div>
                </div>
                <div className="card p-4 flex items-center gap-4 border-amber-100 dark:border-amber-900/30">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-500">{cancelRate}%</p>
                    <p className="text-xs text-[var(--text-muted)]">Cancellation Rate ({cancelCount} tokens)</p>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-5">
                {/* Daily trend */}
                <div className="lg:col-span-2 card p-5">
                  <h3 className="font-bold mb-4">Daily Trend</h3>
                  {dailyTrend.length === 0 ? (
                    <div className="h-52 flex items-center justify-center text-sm text-[var(--text-muted)]">No data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={dailyTrend}>
                        <defs>
                          <linearGradient id="gS2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="gC2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Area type="monotone" dataKey="served" stroke="#10b981" strokeWidth={2} fill="url(#gS2)" name="Served" />
                        <Area type="monotone" dataKey="cancelled" stroke="#f43f5e" strokeWidth={2} fill="url(#gC2)" name="Cancelled" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Token breakdown pie */}
                <div className="card p-5">
                  <h3 className="font-bold mb-4">Token Status</h3>
                  {tokenBreakdown.length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-sm text-[var(--text-muted)]">No data</div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie data={tokenBreakdown} cx="50%" cy="50%"
                               innerRadius={40} outerRadius={70}
                               paddingAngle={3} dataKey="value">
                            {tokenBreakdown.map((s, i) => <Cell key={i} fill={s.color} />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2 mt-2">
                        {tokenBreakdown.map(s => (
                          <div key={s.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                              <span className="text-[var(--text-secondary)]">{s.name}</span>
                            </div>
                            <span className="font-semibold text-[var(--text-primary)]">{s.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Peak hours */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">Peak Hours</h3>
                  {peakHour && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-[var(--text-muted)]">Busiest:</span>
                      <span className="font-bold text-amber-600">{peakHour.hour}</span>
                      <span className="text-[var(--text-muted)]">({peakHour.count} tokens)</span>
                    </div>
                  )}
                </div>
                {hourly.length === 0 ? (
                  <div className="h-44 flex items-center justify-center text-sm text-[var(--text-muted)]">
                    No hourly data for this period
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={hourly} barSize={20}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Tokens" radius={[4, 4, 0, 0]}>
                        {hourly.map((h, i) => (
                          <Cell key={i}
                            fill={h.hour === peakHour?.hour ? '#f59e0b' : '#3366ff'}
                            opacity={h.hour === peakHour?.hour ? 1 : 0.7}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
                {peakHour && (
                  <p className="text-xs text-[var(--text-muted)] mt-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                    Peak hour highlighted in amber — consider opening extra counters during this time
                  </p>
                )}
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  )
}
