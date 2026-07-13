import { Navigate, Outlet } from 'react-router-dom';
import { type Role, Role as Roles } from '@coresphere/shared';
import { useAuth } from '@/features/auth/useAuth';

/**
 * Gate for role-restricted areas. Super Admin always passes. Users lacking an
 * allowed role are redirected (they are authenticated but not authorized).
 */
export function RoleRoute({ allow, redirectTo = '/' }: { allow: Role[]; redirectTo?: string }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const permitted = user.role === Roles.SuperAdmin || allow.includes(user.role);
  return permitted ? <Outlet /> : <Navigate to={redirectTo} replace />;
}
