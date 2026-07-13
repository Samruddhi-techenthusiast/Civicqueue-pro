import { Link } from 'react-router-dom'
import { Menu, Bell, Sun, Moon, Search } from 'lucide-react'
import { useAppDispatch, useUI, useNotifications } from '../../hooks'
import { toggleTheme, toggleMobileSidebar } from '../../store/slices/otherSlices'
import { motion } from 'framer-motion'

export default function Header({ title }) {
  const dispatch = useAppDispatch()
  const { theme } = useUI()
  const { unreadCount } = useNotifications()

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-[var(--border)] bg-[var(--surface)] flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(toggleMobileSidebar())}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-surface-800 transition-colors"
        >
          <Menu className="w-5 h-5 text-[var(--text-secondary)]" />
        </button>
        <h1 className="text-base font-semibold text-[var(--text-primary)]">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-surface-800 transition-colors"
        >
          {theme === 'dark'
            ? <Sun className="w-5 h-5 text-amber-400" />
            : <Moon className="w-5 h-5 text-[var(--text-secondary)]" />}
        </motion.button>

        {/* Notifications */}
        <Link to="/notifications" className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-surface-800 transition-colors">
          <Bell className="w-5 h-5 text-[var(--text-secondary)]" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[var(--surface)]"
            />
          )}
        </Link>
      </div>
    </header>
  )
}
