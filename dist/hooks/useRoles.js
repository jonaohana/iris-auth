"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useHasRole = useHasRole;
exports.useHasPermission = useHasPermission;
exports.useRole = useRole;
exports.usePermissions = usePermissions;
const AuthContext_1 = require("../contexts/AuthContext");
/**
 * Returns whether the current user has the given role (string) or one of the
 * given roles (array). Convenience wrapper over `useAuth().hasRole`.
 *
 * @example const isAdmin = useHasRole('admin');
 */
function useHasRole(role) {
    return (0, AuthContext_1.useAuth)().hasRole(role);
}
/**
 * Returns whether the current user has the given permission (string) or ALL of
 * the given permissions (array). Users whose role is in `config.superRoles`
 * (default `['admin']`) pass automatically.
 *
 * @example const canPublish = useHasPermission('posts.publish');
 */
function useHasPermission(permission) {
    return (0, AuthContext_1.useAuth)().hasPermission(permission);
}
/**
 * Returns the current user's role, or `null` when signed out / no role claim.
 *
 * @example const role = useRole();
 */
function useRole() {
    return (0, AuthContext_1.useAuth)().user?.role ?? null;
}
/** Returns the current user's granular permissions (empty array when none). */
function usePermissions() {
    return (0, AuthContext_1.useAuth)().user?.permissions ?? [];
}
