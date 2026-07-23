"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SUPER_ROLES = void 0;
exports.extractRoleInfo = extractRoleInfo;
exports.checkRole = checkRole;
exports.checkPermission = checkPermission;
/** The default role(s) that bypass all `hasPermission` checks. */
exports.DEFAULT_SUPER_ROLES = ['admin'];
/**
 * Pull `role` and `permissions` out of a raw Firebase custom-claims object,
 * defensively coercing to the expected shapes.
 */
function extractRoleInfo(claims) {
    const safe = claims || {};
    const role = typeof safe.role === 'string' ? safe.role : null;
    const permissions = Array.isArray(safe.permissions)
        ? safe.permissions.filter((p) => typeof p === 'string')
        : [];
    return { role, permissions };
}
/** True when `user`'s role matches `role` (string) or is one of `role` (array). */
function checkRole(user, role) {
    if (!user || !user.role)
        return false;
    return Array.isArray(role) ? role.includes(user.role) : user.role === role;
}
/**
 * True when `user` has `permission`. Array = require ALL. A user whose role is
 * in `superRoles` passes automatically.
 */
function checkPermission(user, permission, superRoles = exports.DEFAULT_SUPER_ROLES) {
    if (!user)
        return false;
    if (user.role && superRoles.includes(user.role))
        return true;
    const owned = user.permissions || [];
    return Array.isArray(permission)
        ? permission.every((p) => owned.includes(p))
        : owned.includes(permission);
}
