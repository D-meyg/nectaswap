import { useAuthStore } from '@/store/authStore'
import type { AdminUser } from '@/api/types'

type Role = AdminUser['role']

interface CanAccessProps {
  roles:    Role | Role[]
  children: React.ReactNode
  fallback?:React.ReactNode
}

/**
 * Role-based access guard for UI elements.
 * Usage: <CanAccess roles={['super_admin', 'admin']}><FreezeButton /></CanAccess>
 */
export function CanAccess({ roles, children, fallback = null }: CanAccessProps) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <>{fallback}</>

  const allowed = Array.isArray(roles) ? roles : [roles]
  if (!allowed.includes(user.role)) return <>{fallback}</>

  return <>{children}</>
}
