import { AuthUser, Permission, Role } from '../types';

/** The default role(s) that bypass all `hasPermission` checks. */
export const DEFAULT_SUPER_ROLES: Role[] = ['admin'];

/**
 * Pull `role` and `permissions` out of a raw Firebase custom-claims object,
 * defensively coercing to the expected shapes.
 */
export function extractRoleInfo(claims: Record<string, any> | undefined | null): {
  role: Role | null;
  permissions: Permission[];
} {
  const safe = claims || {};
  const role = typeof safe.role === 'string' ? (safe.role as Role) : null;
  const permissions = Array.isArray(safe.permissions)
    ? safe.permissions.filter((p: unknown): p is string => typeof p === 'string')
    : [];
  return { role, permissions };
}

/** True when `user`'s role matches `role` (string) or is one of `role` (array). */
export function checkRole(user: AuthUser | null, role: Role | Role[]): boolean {
  if (!user || !user.role) return false;
  return Array.isArray(role) ? role.includes(user.role) : user.role === role;
}

/**
 * True when `user` has `permission`. Array = require ALL. A user whose role is
 * in `superRoles` passes automatically.
 */
export function checkPermission(
  user: AuthUser | null,
  permission: Permission | Permission[],
  superRoles: Role[] = DEFAULT_SUPER_ROLES,
): boolean {
  if (!user) return false;
  if (user.role && superRoles.includes(user.role)) return true;
  const owned = user.permissions || [];
  return Array.isArray(permission)
    ? permission.every((p) => owned.includes(p))
    : owned.includes(permission);
}
