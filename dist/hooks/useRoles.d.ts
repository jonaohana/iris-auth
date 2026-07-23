import { Permission, Role } from '../types';
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
//# sourceMappingURL=useRoles.d.ts.map