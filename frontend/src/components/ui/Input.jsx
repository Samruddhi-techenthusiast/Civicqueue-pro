import { forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'

const Input = forwardRef(({ label, error, icon: Icon, suffix, className = '', hint, required, ...props }, ref) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label className="label">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    <div className="relative">
      {Icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"><Icon className="w-4 h-4" /></span>}
      <input
        ref={ref}
        className={`input ${Icon ? 'pl-10' : ''} ${suffix ? 'pr-16' : ''} ${error ? 'border-red-400 focus:ring-red-400' : ''} ${className}`}
        {...props}
      />
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] font-medium">{suffix}</span>}
    </div>
    {error && <p className="flex items-center gap-1 text-xs text-red-500"><AlertCircle className="w-3 h-3" />{error}</p>}
    {hint && !error && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
  </div>
))
Input.displayName = 'Input'
export default Input
