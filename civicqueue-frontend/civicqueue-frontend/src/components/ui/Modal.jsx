import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, size = 'md', footer }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative card w-full ${sizes[size]} max-h-[90vh] flex flex-col z-10`}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)] flex-shrink-0">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">{title}</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-800 transition-colors">
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>
            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">{children}</div>
            {/* Footer */}
            {footer && <div className="p-6 border-t border-[var(--border)] flex-shrink-0 flex items-center justify-end gap-3">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
