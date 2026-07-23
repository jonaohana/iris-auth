import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Permission, Role } from '../types';

export interface RoleGateProps {
  /** Require the user's role to match this role (or be one of these roles). */
  role?: Role | Role[];
  /** Require this permission (or ALL of these permissions). */
  permission?: Permission | Permission[];
  /**
   * When both `role` and `permission` are given, require BOTH by default.
   * Set `requireAll={false}` to allow access if EITHER check passes.
   */
  requireAll?: boolean;
  /** Rendered when the user is not allowed. Defaults to nothing. */
  fallback?: ReactNode;
  /** Rendered while auth state is still loading. Defaults to nothing. */
  loadingFallback?: ReactNode;
  children: ReactNode;
}

/**
 * Conditionally renders children based on the current user's role/permissions.
 * Cross-platform (web + native) — it only renders, it does not gate any data,
 * so always enforce authorization on the server / in security rules too.
 *
 * @example
 * <RoleGate role="admin" fallback={<NoAccess />}>
 *   <AdminPanel />
 * </RoleGate>
 *
 * <RoleGate permission={['billing.read', 'billing.write']}>
 *   <BillingSettings />
 * </RoleGate>
 */
export const RoleGate: React.FC<RoleGateProps> = ({
  role,
  permission,
  requireAll = true,
  fallback = null,
  loadingFallback = null,
  children,
}) => {
  const { loading, hasRole, hasPermission } = useAuth();

  if (loading) return <>{loadingFallback}</>;

  const checks: boolean[] = [];
  if (role !== undefined) checks.push(hasRole(role));
  if (permission !== undefined) checks.push(hasPermission(permission));

  // No constraints given → treat as "any signed-in-aware" gate that passes.
  const allowed =
    checks.length === 0
      ? true
      : requireAll
        ? checks.every(Boolean)
        : checks.some(Boolean);

  return <>{allowed ? children : fallback}</>;
};
