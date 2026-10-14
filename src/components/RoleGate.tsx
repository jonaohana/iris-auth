import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Permission, Role } from '../types';
import type { AppRole, TenantRole } from '../access/claims';

export interface RoleGateProps {
  /** Require the user's role to match this role (or be one of these roles). */
  role?: Role | Role[];
  /** Require this permission (or ALL of these permissions). */
  permission?: Permission | Permission[];
  /** Super admins only. */
  superAdmin?: boolean;
  /** Require admin (or `appRole`) of this app. */
  app?: string;
  appRole?: AppRole;
  /** Require membership of this store / team (`staff` or higher unless `tenantRole` says otherwise). */
  tenant?: { app: string; id: string };
  tenantRole?: TenantRole;
  /**
   * When more than one of the checks above is given, require BOTH by default.
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
  superAdmin,
  app,
  appRole,
  tenant,
  tenantRole,
  requireAll = true,
  fallback = null,
  loadingFallback = null,
  children,
}) => {
  const { loading, hasRole, hasPermission, isSuperAdmin, hasAppRole, hasTenantRole } = useAuth();

  if (loading) return <>{loadingFallback}</>;

  const checks: boolean[] = [];
  if (role !== undefined) checks.push(hasRole(role));
  if (permission !== undefined) checks.push(hasPermission(permission));
  if (superAdmin) checks.push(isSuperAdmin());
  if (app !== undefined) checks.push(hasAppRole(app, appRole));
  if (tenant) checks.push(hasTenantRole(tenant.app, tenant.id, tenantRole));

  // No constraints given → treat as "any signed-in-aware" gate that passes.
  const allowed =
    checks.length === 0
      ? true
      : requireAll
        ? checks.every(Boolean)
        : checks.some(Boolean);

  return <>{allowed ? children : fallback}</>;
};
