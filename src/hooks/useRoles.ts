import { useAuth } from '../contexts/AuthContext';
import { Permission, Role } from '../types';

/**
 * Returns whether the current user has the given role (string) or one of the
 * given roles (array). Convenience wrapper over `useAuth().hasRole`.
 *
 * @example const isAdmin = useHasRole('admin');
 */
export function useHasRole(role: Role | Role[]): boolean {
  return useAuth().hasRole(role);
}

/**
 * Returns whether the current user has the given permission (string) or ALL of
 * the given permissions (array). Users whose role is in `config.superRoles`
 * (default `['admin']`) pass automatically.
 *
 * @example const canPublish = useHasPermission('posts.publish');
 */
export function useHasPermission(permission: Permission | Permission[]): boolean {
  return useAuth().hasPermission(permission);
}

/**
 * Returns the current user's role, or `null` when signed out / no role claim.
 *
 * @example const role = useRole();
 */
export function useRole(): Role | null {
  return useAuth().user?.role ?? null;
}

/** Returns the current user's granular permissions (empty array when none). */
export function usePermissions(): Permission[] {
  return useAuth().user?.permissions ?? [];
}
