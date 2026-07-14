import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'

// ── Table ─────────────────────────────────────────────────────────────────────
export function Table({ columns, data, loading, emptyMessage = 'No data found', onRowClick }) {
  if (loading) return <TableSkeleton cols={columns.length} />
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border)]">
            {columns.map(col => (
              <th key={col.key} className={`table-header text-left pb-3 px-2 first:pl-0 ${col.className || ''}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} className="text-center py-12 text-[var(--text-muted)] text-sm">{emptyMessage}</td></tr>
          ) : data.map((row, i) => (
            <motion.tr
              key={row._id || row.id || i}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onRowClick?.(row)}
              className={`${onRowClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-surface-800/50' : ''} transition-colors`}
            >
              {columns.map(col => (
                <td key={col.key} className={`table-cell px-2 first:pl-0 ${col.className || ''}`}>
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TableSkeleton({ cols }) {
  return (
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="grid gap-4 py-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {[...Array(cols)].map((_, j) => <div key={j} className="skeleton h-4" />)}
        </div>
      ))}
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────
export function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null
  const { page, totalPages, total, limit } = pagination
  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)
  return (
    <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
      <p className="text-sm text-[var(--text-muted)]">Showing {from}–{to} of {total}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-800 disabled:opacity-30 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {[...Array(Math.min(5, totalPages))].map((_, i) => {
          const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i
          return (
            <button key={p} onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-civic-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-surface-800 text-[var(--text-secondary)]'}`}>
              {p}
            </button>
          )
        })}
        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-800 disabled:opacity-30 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'gray', dot }) {
  const map = { blue:'badge-blue', green:'badge-green', amber:'badge-amber', red:'badge-red', gray:'badge-gray', purple:'badge-purple' }
  return (
    <span className={map[variant] || 'badge-gray'}>
      {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />}
      {children}
    </span>
  )
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ label, options, className = '', error, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <select className={`input appearance-none pr-9 ${error ? 'border-red-400' : ''} ${className}`} {...props}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className = '' }) {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10', xl: 'w-16 h-16' }
  return (
    <div className={`${s[size]} border-2 border-civic-500/20 border-t-civic-500 rounded-full animate-spin ${className}`} />
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', padding = true }) {
  return <div className={`card ${padding ? 'p-6' : ''} ${className}`}>{children}</div>
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-surface-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[var(--text-muted)]" />
      </div>}
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
      {description && <p className="text-sm text-[var(--text-muted)] mb-6 max-w-sm">{description}</p>}
      {action}
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ title, value, subtitle, icon: Icon, iconColor = 'blue', trend, loading }) {
  const colors = {
    blue:   'bg-civic-50 text-civic-600 dark:bg-civic-950/40 dark:text-civic-400',
    green:  'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    amber:  'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    red:    'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400',
    purple: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400',
  }
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--text-muted)] font-medium">{title}</p>
          {loading ? <div className="skeleton h-8 w-24 mt-1" /> :
            <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">{value}</p>}
          {subtitle && <p className="text-xs text-[var(--text-muted)] mt-1">{subtitle}</p>}
        </div>
        {Icon && <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[iconColor]}`}>
          <Icon className="w-5 h-5" />
        </div>}
      </div>
      {trend !== undefined && !loading && (
        <p className={`text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs yesterday
        </p>
      )}
    </div>
  )
}
