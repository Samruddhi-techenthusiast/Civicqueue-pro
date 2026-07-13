import { TOKEN_STATUS, QUEUE_STATUS, APPT_STATUS, PRIORITY } from '../constants'

export const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
export const formatTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'
export const formatDateTime = (d) => d ? `${formatDate(d)}, ${formatTime(d)}` : '—'
export const formatRelative = (d) => {
  if (!d) return '—'
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return formatDate(d)
}

export const getTokenBadge = (status) => {
  const s = status?.toUpperCase()
  const map = { WAITING: 'badge-amber', SERVING: 'badge-blue', SERVED: 'badge-green', CANCELLED: 'badge-red', NO_SHOW: 'badge-gray' }
  return map[s] || 'badge-gray'
}

export const getQueueBadge = (status) => {
  const map = { open: 'badge-green', paused: 'badge-amber', closed: 'badge-gray' }
  return map[status] || 'badge-gray'
}

export const getApptBadge = (status) => {
  const map = { scheduled: 'badge-blue', confirmed: 'badge-green', checked_in: 'badge-purple', completed: 'badge-gray', cancelled: 'badge-red', no_show: 'badge-red' }
  return map[status] || 'badge-gray'
}

export const getPriorityBadge = (priority) => {
  const map = { normal: 'badge-gray', high: 'badge-amber', urgent: 'badge-red' }
  return map[priority] || 'badge-gray'
}

export const getTokenStatusInfo = (status) => TOKEN_STATUS[status?.toUpperCase()] || { label: status, color: 'gray', dot: '#94a3b8' }
export const getQueueStatusInfo  = (status) => QUEUE_STATUS[status?.toUpperCase()] || { label: status, color: 'gray' }
export const getApptStatusInfo   = (status) => APPT_STATUS[status?.toUpperCase()] || { label: status, color: 'gray' }
export const getPriorityInfo     = (priority) => PRIORITY[priority] || { label: priority, color: 'gray' }

export const clsx = (...args) => args.filter(Boolean).join(' ')

export const formatEWT = (mins) => {
  if (!mins || mins <= 0) return 'Now'
  if (mins < 60) return `~${mins} min`
  return `~${Math.round(mins / 60)}h ${mins % 60}m`
}

export const todayISO = () => new Date().toISOString().slice(0, 10)

export const roleLabel = (role) => ({ citizen: 'Citizen', staff: 'Staff', admin: 'Admin', super_admin: 'Super Admin' }[role] || role)
