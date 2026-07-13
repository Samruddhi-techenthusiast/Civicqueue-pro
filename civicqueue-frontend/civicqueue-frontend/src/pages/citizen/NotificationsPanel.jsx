import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellOff, Check, CheckCheck, Ticket, Calendar, Info } from 'lucide-react'
import { useAppDispatch, useNotifications } from '../../hooks'
import { fetchNotifications, markAllRead, markOneRead } from '../../store/slices/otherSlices'
import { Card, Spinner, EmptyState, Pagination } from '../../components/ui/index.jsx'
import Button from '../../components/ui/Button'
import { formatRelative } from '../../utils'
import { useState } from 'react'

const typeIcon = {
  token_issued:  { icon: Ticket,   color: 'text-civic-500',   bg: 'bg-civic-50 dark:bg-civic-950/30'   },
  token_called:  { icon: Bell,     color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-950/30'   },
  token_served:  { icon: Check,    color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30'},
  token_cancelled:{ icon: BellOff, color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-950/30'      },
  appointment_confirmed: { icon: Calendar, color: 'text-civic-500', bg: 'bg-civic-50 dark:bg-civic-950/30' },
  appointment_cancelled: { icon: Calendar, color: 'text-red-500',   bg: 'bg-red-50 dark:bg-red-950/30'     },
  appointment_reminder:  { icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30'  },
}

export default function NotificationsPanel() {
  const dispatch = useAppDispatch()
  const { list, unreadCount, loading, pagination } = useNotifications()
  const [page, setPage] = useState(1)
  const [marking, setMarking] = useState(false)

  useEffect(() => { dispatch(fetchNotifications({ page, limit: 15 })) }, [page])

  const handleMarkAll = async () => {
    setMarking(true)
    await dispatch(markAllRead())
    setMarking(false)
  }

  const handleMarkOne = (id, isRead) => {
    if (!isRead) dispatch(markOneRead(id))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Notifications</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-[var(--text-muted)] mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" loading={marking} icon={CheckCheck} onClick={handleMarkAll}>
            Mark all read
          </Button>
        )}
      </div>

      <Card padding={false}>
        {loading && list.length === 0 ? (
          <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
        ) : list.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up! Notifications about your tokens and appointments will appear here." />
        ) : (
          <div className="divide-y divide-[var(--border)]">
            <AnimatePresence initial={false}>
              {list.map((n, i) => {
                const t = typeIcon[n.type] || { icon: Info, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-surface-800' }
                const Icon = t.icon
                return (
                  <motion.button key={n._id} layout
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleMarkOne(n._id, n.isRead)}
                    className={`w-full flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-surface-800/60 transition-colors text-left ${!n.isRead ? 'bg-civic-50/40 dark:bg-civic-950/10' : ''}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${t.bg}`}>
                      <Icon className={`w-5 h-5 ${t.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium ${!n.isRead ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'} leading-snug`}>
                          {n.title}
                        </p>
                        <span className="text-xs text-[var(--text-muted)] flex-shrink-0">{formatRelative(n.createdAt)}</span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-civic-500 flex-shrink-0 mt-1.5" />}
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </div>
        )}
        {pagination && <div className="p-4 border-t border-[var(--border)]"><Pagination pagination={pagination} onPageChange={setPage} /></div>}
      </Card>
    </div>
  )
}
