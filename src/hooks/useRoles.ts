import { useAuth } from '../contexts/AuthContext';
import { Permission, Role } from '../types';
import type { AppRole, TenantRole } from '../access/claims';

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

/** True for a super admin (`role: 'superadmin'`). */
export function useIsSuperAdmin(): boolean {
  return useAuth().isSuperAdmin();
}

/** True for a super admin, or an admin (or `min` and above) of `app`. Scoped per app: admin of one app is not admin of another. */
export function useHasAppRole(app: string, min?: AppRole): boolean {
  return useAuth().hasAppRole(app, min);
}

/** True for a super admin, or a member of that store / team at `min` (default `staff`) or higher. */
export function useHasTenantRole(app: string, id: string, min?: TenantRole): boolean {
  return useAuth().hasTenantRole(app, id, min);
}
