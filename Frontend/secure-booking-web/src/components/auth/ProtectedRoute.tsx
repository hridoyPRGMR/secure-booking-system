import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div
        role="status"
        aria-label="Checking session"
        className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"
      />
    </div>
  )
}

interface ProtectedRouteProps {
  /** Restrict access to users holding at least one of these roles/claims. */
  allowedRoles?: string[]
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps = {}) => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <FullPageSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles?.length && !allowedRoles.some((role) => user?.roles?.includes(role))) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
