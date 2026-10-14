"use strict";
// ============================================================================
// Access tiers — the shared definition of who may do what, read from Firebase custom claims.
//
//   super admin   role: 'superadmin'                          everything, everywhere
//   app admin     apps:    { ganjahub: 'admin' }               admin of that app only
//   tenant roles  tenants: { 'ganjahub/<storeId>': 'owner' }  one store / team / org inside an app
//   everyone else role: 'user' (or none)
//
// Pure functions, no Firebase or React imports: the client, Cloud Functions and every backend use this file.
// One Firebase project serves all iris apps, so every grant is scoped by app name — a bare `role: 'admin'` would
// be admin everywhere. (`role: 'admin'` is still honoured as "admin of every app" for older claims.)
// ============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSuperAdmin = exports.tenantKey = exports.tenantRank = exports.appRank = exports.isTenantRole = exports.isAppRole = exports.ID_RE = exports.NAME_RE = exports.AccessError = exports.CLAIMS_MAX_BYTES = exports.TENANT_ROLES = exports.APP_ROLES = exports.SUPER_ADMIN_ROLE = void 0;
exports.splitTenantKey = splitTenantKey;
exports.parseClaims = parseClaims;
exports.claimsBytes = claimsBytes;
exports.hasAppRole = hasAppRole;
exports.hasTenantRole = hasTenantRole;
exports.tenantsOf = tenantsOf;
exports.SUPER_ADMIN_ROLE = 'superadmin';
exports.APP_ROLES = ['staff', 'admin'];
exports.TENANT_ROLES = ['staff', 'manager', 'owner'];
/** Firebase rejects custom claims larger than this many bytes of JSON. */
exports.CLAIMS_MAX_BYTES = 1000;
class AccessError extends Error {
    constructor(message, code = 'invalid') {
        super(message);
        this.code = code;
        this.name = 'AccessError';
    }
}
exports.AccessError = AccessError;
exports.NAME_RE = /^[a-z][a-z0-9_-]{0,31}$/;
exports.ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
const isAppRole = (v) => exports.APP_ROLES.includes(v);
exports.isAppRole = isAppRole;
const isTenantRole = (v) => exports.TENANT_ROLES.includes(v);
exports.isTenantRole = isTenantRole;
/** Higher = more powerful. */
const appRank = (r) => exports.APP_ROLES.indexOf(r);
exports.appRank = appRank;
const tenantRank = (r) => exports.TENANT_ROLES.indexOf(r);
exports.tenantRank = tenantRank;
const tenantKey = (app, id) => app + '/' + id;
exports.tenantKey = tenantKey;
function splitTenantKey(key) {
    const i = key.indexOf('/');
    if (i <= 0)
        return null;
    const app = key.slice(0, i);
    const id = key.slice(i + 1);
    return exports.NAME_RE.test(app) && exports.ID_RE.test(id) ? { app, id } : null;
}
/** Normalise raw custom claims (or a verified ID token) into AccessClaims, dropping anything malformed. */
function parseClaims(raw) {
    const src = raw || {};
    const apps = {};
    const tenants = {};
    if (src.apps && typeof src.apps === 'object') {
        for (const [k, v] of Object.entries(src.apps))
            if (exports.NAME_RE.test(k) && (0, exports.isAppRole)(v))
                apps[k] = v;
    }
    if (src.tenants && typeof src.tenants === 'object') {
        for (const [k, v] of Object.entries(src.tenants))
            if (splitTenantKey(k) && (0, exports.isTenantRole)(v))
                tenants[k] = v;
    }
    return {
        role: typeof src.role === 'string' ? src.role : null,
        apps,
        tenants,
        permissions: Array.isArray(src.permissions) ? src.permissions.filter((p) => typeof p === 'string') : [],
    };
}
/** UTF-8 size of the claims as Firebase measures them (no TextEncoder: it is missing on older React Native). */
function claimsBytes(raw) {
    const json = JSON.stringify(raw ?? {});
    let bytes = 0;
    for (let i = 0; i < json.length; i++) {
        const c = json.charCodeAt(i);
        if (c < 0x80)
            bytes += 1;
        else if (c < 0x800)
            bytes += 2;
        else if (c >= 0xd800 && c <= 0xdbff) {
            bytes += 4;
            i++;
        } // surrogate pair
        else
            bytes += 3;
    }
    return bytes;
}
const isSuperAdmin = (c) => !!c && c.role === exports.SUPER_ADMIN_ROLE;
exports.isSuperAdmin = isSuperAdmin;
/** Super admins pass. Otherwise an explicit `apps[app]` at or above `min`, or a legacy global `role: 'admin'`. */
function hasAppRole(c, app, min = 'admin') {
    if (!c)
        return false;
    if ((0, exports.isSuperAdmin)(c) || c.role === 'admin')
        return true;
    const have = c.apps[app];
    return !!have && (0, exports.appRank)(have) >= (0, exports.appRank)(min);
}
/**
 * Super admins pass. Otherwise the user must hold an explicit role on that store/team at or above `min`.
 * Being an app admin does NOT imply this: apps decide whether their admins may act inside a tenant.
 */
function hasTenantRole(c, app, id, min = 'staff') {
    if (!c)
        return false;
    if ((0, exports.isSuperAdmin)(c))
        return true;
    const have = c.tenants[(0, exports.tenantKey)(app, id)];
    return !!have && (0, exports.tenantRank)(have) >= (0, exports.tenantRank)(min);
}
/** The tenants of `app` the user belongs to, with their role on each. */
function tenantsOf(c, app) {
    if (!c)
        return [];
    const out = [];
    for (const [k, role] of Object.entries(c.tenants)) {
        const parts = splitTenantKey(k);
        if (parts && parts.app === app)
            out.push({ id: parts.id, role });
    }
    return out;
}
