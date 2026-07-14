import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useAppDispatch, useUI } from '../../hooks'
import { fetchNotifications } from '../../store/slices/otherSlices'
import { useSocketEvent } from '../../hooks'
import { addLiveNotification } from '../../store/slices/otherSlices'
import toast from 'react-hot-toast'
import { Bell } from 'lucide-react'

const pageTitles = {
  '/dashboard':          'My Dashboard',
  '/queue':              'Get Queue Token',
  '/track':              'Live Queue Tracking',
  '/appointments':       'My Appointments',
  '/notifications':      'Notifications',
  '/staff':              'Staff Dashboard',
  '/staff/queue':        'Queue Management',
  '/staff/appointments': 'Appointments',
  '/admin':              'Admin Dashboard',
  '/admin/departments':  'Departments',
  '/admin/users':        'User Management',
  '/admin/analytics':    'Analytics',
}

export default function DashboardLayout() {
  const dispatch = useAppDispatch()
  const { theme } = useUI()
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'CivicQueue'

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    dispatch(fetchNotifications({ limit: 20 }))
  }, [])

  // Live notifications via socket
  useSocketEvent('notification:new', (notification) => {
    dispatch(addLiveNotification(notification))
    toast(notification.title, {
      icon: '🔔',
      style: { fontFamily: 'Sora, sans-serif', borderRadius: '12px', fontSize: '14px' },
    })
  })

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
