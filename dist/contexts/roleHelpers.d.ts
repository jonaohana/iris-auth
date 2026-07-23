import { AuthUser, Permission, Role } from '../types';
/** The default role(s) that bypass all `hasPermission` checks. */
export declare const DEFAULT_SUPER_ROLES: Role[];
/**
 * Pull `role` and `permissions` out of a raw Firebase custom-claims object,
 * defensively coercing to the expected shapes.
 */
export declare function extractRoleInfo(claims: Record<string, any> | undefined | null): {
    role: Role | null;
    permissions: Permission[];
};
/** True when `user`'s role matches `role` (string) or is one of `role` (array). */
export declare function checkRole(user: AuthUser | null, role: Role | Role[]): boolean;
/**
 * True when `user` has `permission`. Array = require ALL. A user whose role is
 * in `superRoles` passes automatically.
 */
export declare function checkPermission(user: AuthUser | null, permission: Permission | Permission[], superRoles?: Role[]): boolean;
//# sourceMappingURL=roleHelpers.d.ts.map