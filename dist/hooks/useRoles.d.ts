import { Permission, Role } from '../types';
import type { AppRole, TenantRole } from '../access/claims';
/**
 * Returns whether the current user has the given role (string) or one of the
 * given roles (array). Convenience wrapper over `useAuth().hasRole`.
 *
 * @example const isAdmin = useHasRole('admin');
 */
export declare function useHasRole(role: Role | Role[]): boolean;
/**
 * Returns whether the current user has the given permission (string) or ALL of
 * the given permissions (array). Users whose role is in `config.superRoles`
 * (default `['admin']`) pass automatically.
 *
 * @example const canPublish = useHasPermission('posts.publish');
 */
export declare function useHasPermission(permission: Permission | Permission[]): boolean;
/**
 * Returns the current user's role, or `null` when signed out / no role claim.
 *
 * @example const role = useRole();
 */
export declare function useRole(): Role | null;
/** Returns the current user's granular permissions (empty array when none). */
export declare function usePermissions(): Permission[];
/** True for a super admin (`role: 'superadmin'`). */
export declare function useIsSuperAdmin(): boolean;
/** True for a super admin, or an admin (or `min` and above) of `app`. Scoped per app: admin of one app is not admin of another. */
export declare function useHasAppRole(app: string, min?: AppRole): boolean;
/** True for a super admin, or a member of that store / team at `min` (default `staff`) or higher. */
export declare function useHasTenantRole(app: string, id: string, min?: TenantRole): boolean;
//# sourceMappingURL=useRoles.d.ts.map