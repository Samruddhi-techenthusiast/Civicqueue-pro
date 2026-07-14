import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks'
import { ROLES } from '../../constants'
import { Spinner } from '../ui/index.jsx'

export default function ProtectedRoute({ children, roles }) {
  const { user, accessToken } = useAuth()
  const location = useLocation()

  if (!accessToken || !user) return <Navigate to="/login" state={{ from: location }} replace />

  if (roles && !roles.includes(user.role)) {
    const redirect = [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(user.role) ? '/admin'
                   : user.role === ROLES.STAFF ? '/staff' : '/dashboard'
    return <Navigate to={redirect} replace />
  }

  return children
}

export function GuestRoute({ children }) {
  const { user, accessToken } = useAuth()
  if (accessToken && user) {
    const redirect = [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(user.role) ? '/admin'
                   : user.role === ROLES.STAFF ? '/staff' : '/dashboard'
    return <Navigate to={redirect} replace />
  }
  return children
}
