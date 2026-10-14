"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateChange = validateChange;
exports.authorizeChange = authorizeChange;
exports.reducesAccess = reducesAccess;
exports.applyChange = applyChange;
// Who may change whose access, and how a change is applied to the raw claims. Pure: no Firebase, no I/O.
// The Cloud Function / RoleAdmin call authorizeChange() first and applyChange() second.
const claims_1 = require("./claims");
const no = (reason) => ({ ok: false, reason });
const ROLE_RE = claims_1.NAME_RE;
/** Shape check only — says nothing about who is asking. */
function validateChange(change) {
    if (!change || typeof change !== 'object')
        return 'Missing change.';
    if (change.role !== undefined && change.role !== null && !ROLE_RE.test(change.role))
        return 'Invalid role name.';
    for (const [app, r] of Object.entries(change.apps ?? {})) {
        if (!claims_1.NAME_RE.test(app))
            return 'Invalid app name: ' + app;
        if (r !== null && !(0, claims_1.isAppRole)(r))
            return 'Invalid app role for ' + app + '.';
    }
    for (const [key, r] of Object.entries(change.tenants ?? {})) {
        if (!(0, claims_1.splitTenantKey)(key))
            return 'Invalid tenant key (use app/id): ' + key;
        if (r !== null && !(0, claims_1.isTenantRole)(r))
            return 'Invalid tenant role for ' + key + '.';
    }
    if (change.role === undefined && !change.apps && !change.tenants)
        return 'Nothing to change.';
    return null;
}
/**
 * May `caller` apply `change` to `target`?
 *  - super admin: anything, except changing their own platform role (no accidental self-lockout).
 *  - platform roles and app roles: super admin only.
 *  - tenant roles: super admin, an admin of that tenant's app, or an owner of that tenant
 *    (an owner may add or remove managers and staff, never owners).
 *  - nobody but a super admin may touch a super admin.
 */
function authorizeChange(caller, target, change) {
    const bad = validateChange(change);
    if (bad)
        return no(bad);
    const callerIsSuper = (0, claims_1.isSuperAdmin)(caller.claims);
    if (callerIsSuper) {
        if (change.role !== undefined && caller.uid === target.uid)
            return no('You cannot change your own role.');
        return { ok: true };
    }
    if ((0, claims_1.isSuperAdmin)(target.claims))
        return no('Only a super admin can change a super admin.');
    if (change.role !== undefined)
        return no('Only a super admin can change platform roles.');
    if (change.apps && Object.keys(change.apps).length)
        return no('Only a super admin can change app roles.');
    for (const [key, next] of Object.entries(change.tenants ?? {})) {
        const { app } = (0, claims_1.splitTenantKey)(key);
        if ((0, claims_1.hasAppRole)(caller.claims, app, 'admin'))
            continue;
        if (caller.claims.tenants[key] === 'owner') {
            if (next === 'owner')
                return no('Only a super admin or the app admin can make someone an owner.');
            if (target.claims.tenants[key] === 'owner')
                return no('An owner cannot change another owner.');
            continue;
        }
        return no('You do not manage ' + key + '.');
    }
    return { ok: true };
}
/**
 * True when `after` gives the user less than `before` (a role dropped, an app or store role removed or lowered).
 * Removing access should also end the user's existing sessions, because their old token keeps working for up to an hour.
 */
function reducesAccess(before, after) {
    const platformRank = (r) => (r === 'superadmin' ? 2 : r === 'admin' ? 1 : 0);
    if (platformRank(after.role) < platformRank(before.role))
        return true;
    for (const [app, r] of Object.entries(before.apps)) {
        const now = after.apps[app];
        if (!now || (0, claims_1.appRank)(now) < (0, claims_1.appRank)(r))
            return true;
    }
    for (const [key, r] of Object.entries(before.tenants)) {
        const now = after.tenants[key];
        if (!now || (0, claims_1.tenantRank)(now) < (0, claims_1.tenantRank)(r))
            return true;
    }
    return false;
}
/**
 * Merge `change` into the user's existing raw claims, keeping every unrelated claim.
 * Throws AccessError if the result would exceed Firebase's 1000-byte claims limit.
 */
function applyChange(existing, change) {
    const bad = validateChange(change);
    if (bad)
        throw new claims_1.AccessError(bad, 'invalid');
    const next = { ...(existing || {}) };
    if (change.role !== undefined) {
        if (change.role === null)
            delete next.role;
        else
            next.role = change.role;
    }
    const merge = (field, patch) => {
        if (!patch)
            return;
        const map = { ...(next[field] || {}) };
        for (const [k, v] of Object.entries(patch)) {
            if (v === null)
                delete map[k];
            else
                map[k] = v;
        }
        if (Object.keys(map).length)
            next[field] = map;
        else
            delete next[field];
    };
    merge('apps', change.apps);
    merge('tenants', change.tenants);
    const size = (0, claims_1.claimsBytes)(next);
    if (size > claims_1.CLAIMS_MAX_BYTES) {
        throw new claims_1.AccessError('Access would use ' + size + ' of the ' + claims_1.CLAIMS_MAX_BYTES + ' bytes Firebase allows for custom claims.', 'too-large');
    }
    return next;
}
