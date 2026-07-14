import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

const variants = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  ghost:     'btn-ghost',
  danger:    'btn-danger',
  outline:   'border border-civic-500 text-civic-600 dark:text-civic-400 hover:bg-civic-50 dark:hover:bg-civic-950/30 font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 active:scale-95',
}

const sizes = {
  sm:  'text-xs px-3 py-1.5 rounded-lg',
  md:  '',
  lg:  'text-base px-6 py-3',
  xl:  'text-lg px-8 py-4',
  icon: 'p-2 rounded-xl',
}

export default function Button({
  children, variant = 'primary', size = 'md', loading, icon: Icon,
  iconRight, className = '', fullWidth, ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full flex justify-center' : 'inline-flex'} items-center gap-2 ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon ? <Icon className="w-4 h-4" /> : null}
      {children}
      {iconRight && !loading && <iconRight className="w-4 h-4" />}
    </motion.button>
  )
}
