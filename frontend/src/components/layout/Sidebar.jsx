import {  NavLink, useNavigate } from 'react-router-dom'
import {TrendingUp}from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Ticket, Calendar, Bell, Users, Building2,
  BarChart3, QrCode, LogOut, ChevronLeft, Menu, Shield
} from 'lucide-react'
import { useAppDispatch, useAuth, useUI } from '../../hooks'
import { logout } from '../../store/slices/authSlice'
import { setSidebar, toggleMobileSidebar } from '../../store/slices/otherSlices'
import { ROLES } from '../../constants'

const citizenNav = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/queue',         icon: Ticket,           label: 'Get Token'   },
  { to: '/track',         icon: QrCode,           label: 'Track Queue' },
  { to: '/appointments',  icon: Calendar,         label: 'Appointments'},
  { to: '/notifications', icon: Bell,             label: 'Notifications'},
]

const staffNav = [
  { to: '/staff',              icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/staff/queue',        icon: Ticket,          label: 'Queue Mgmt' },
  { to: '/staff/appointments', icon: Calendar,        label: 'Appointments'},
  { to: '/notifications',      icon: Bell,            label: 'Notifications'},
]

const adminNav = [
  { to: '/admin',              icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/admin/departments',  icon: Building2,       label: 'Departments'  },
  { to: '/admin/users',        icon: Users,           label: 'Users'        },
  { to: '/admin/analytics',      icon: BarChart3,       label: 'Analytics'      },
  { to: '/admin/staff-performance', icon: TrendingUp,      label: 'Staff Performance' },
  { to: '/notifications',      icon: Bell,            label: 'Notifications'},
]

export default function Sidebar() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { sidebarOpen, mobileSidebarOpen } = useUI()

  const isAdmin  = [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(user?.role)
  const isStaff  = user?.role === ROLES.STAFF
  const navItems = isAdmin ? adminNav : isStaff ? staffNav : citizenNav

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-[var(--border)] ${!sidebarOpen ? 'justify-center' : ''}`}>
        <img
            src="/civicQueue.png"
            alt="CivicQueue Logo"
           className="w-10 h-10 object-contain"
          />
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <p className="font-bold text-[var(--text-primary)] leading-tight">CivicQueue</p>
              <p className="text-xs text-[var(--text-muted)]">Queue Management</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto hide-scrollbar">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/dashboard' || item.to === '/admin' || item.to === '/staff'}>
            {({ isActive }) => (
              <span className={isActive ? 'nav-item-active' : 'nav-item'} style={{ display: 'flex' }}>
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="truncate">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-[var(--border)] space-y-1">
        {sidebarOpen && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1">
            <div className="w-8 h-8 rounded-full bg-civic-100 dark:bg-civic-950/50 flex items-center justify-center text-civic-600 dark:text-civic-400 font-bold text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{user?.name}</p>
              <p className="text-xs text-[var(--text-muted)] capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className={`nav-item w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 ${!sidebarOpen ? 'justify-center' : ''}`}>
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => dispatch(setSidebar(!sidebarOpen))}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-sm items-center justify-center hover:bg-slate-50 dark:hover:bg-surface-800 transition-colors"
      >
        <ChevronLeft className={`w-3.5 h-3.5 text-[var(--text-secondary)] transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`} />
      </button>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 72 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col relative bg-[var(--surface)] border-r border-[var(--border)] overflow-hidden flex-shrink-0"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => dispatch(toggleMobileSidebar())}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 w-60 z-50 lg:hidden bg-[var(--surface)] border-r border-[var(--border)] overflow-hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
