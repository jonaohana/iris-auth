"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.levelOf = exports.roleOf = void 0;
exports.defineCatalog = defineCatalog;
exports.covers = covers;
exports.permissionsOf = permissionsOf;
exports.can = can;
exports.assertRole = assertRole;
exports.validPermission = validPermission;
// Pure checks over a role catalog. No I/O.
const types_1 = require("./types");
const PERMISSION_RE = /^(\*|[a-z][a-z0-9_-]*(\.([a-z][a-z0-9_-]*|\*))*)$/;
const ROLE_NAME_RE = /^[a-z][a-z0-9_-]{0,31}$/;
/** Throws on a malformed catalog so a typo fails at startup, not when someone is locked out. */
function defineCatalog(catalog) {
    if (!/^[a-z][a-z0-9_-]{0,31}$/.test(catalog.app))
        throw new Error('Catalog app name is invalid: ' + catalog.app);
    const names = Object.keys(catalog.roles);
    if (!names.length)
        throw new Error('Catalog needs at least one role.');
    for (const name of names) {
        const r = catalog.roles[name];
        if (!ROLE_NAME_RE.test(name))
            throw new Error('Invalid role name: ' + name);
        if (!r.title || !Number.isFinite(r.level))
            throw new Error('Role ' + name + ' needs a title and a numeric level.');
        for (const p of r.permissions)
            if (!PERMISSION_RE.test(p))
                throw new Error('Invalid permission "' + p + '" on ' + name);
    }
    return catalog;
}
const roleOf = (catalog, role) => catalog.roles[role] ?? null;
exports.roleOf = roleOf;
/** Does a granted permission cover the wanted one? '*' covers all; 'orders.*' covers 'orders.view'. */
function covers(granted, wanted) {
    if (granted === '*' || granted === wanted)
        return true;
    return granted.endsWith('.*') && wanted.startsWith(granted.slice(0, -1));
}
/** Everything the member may do: their role's permissions plus personal extras. Inactive members can do nothing. */
function permissionsOf(catalog, member) {
    if (!member || !member.active)
        return [];
    const def = (0, exports.roleOf)(catalog, member.role);
    if (!def)
        return [];
    return [...def.permissions, ...(member.permissions ?? [])];
}
function can(catalog, member, permission) {
    return permissionsOf(catalog, member).some((g) => covers(g, permission));
}
const levelOf = (catalog, member) => member && member.active ? (0, exports.roleOf)(catalog, member.role)?.level ?? -1 : -1;
exports.levelOf = levelOf;
function assertRole(catalog, role) {
    const def = (0, exports.roleOf)(catalog, role);
    if (!def)
        throw new types_1.MemberError('Unknown role: ' + role, 'invalid');
    return def;
}
function validPermission(p) {
    return typeof p === 'string' && p.length <= 64 && PERMISSION_RE.test(p);
}
