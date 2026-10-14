"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleAuthError = void 0;
exports.assertAuthenticated = assertAuthenticated;
exports.assertRole = assertRole;
exports.makeSetRoleCallable = makeSetRoleCallable;
exports.makeChangeAccessCallable = makeChangeAccessCallable;
exports.makeAssignDefaultRoleTrigger = makeAssignDefaultRoleTrigger;
/**
 * SERVER-ONLY. Framework-light helpers for wiring role management into Firebase
 * Cloud Functions. These intentionally do NOT import `firebase-functions`, so
 * this package stays free of that dependency — you pass in the callable
 * `data`/`context` (or the created `user`) from your own function definition.
 *
 * Works with both 1st-gen and 2nd-gen callable signatures (see ROLES.md).
 */
const roleAdmin_1 = require("./roleAdmin");
const access_1 = require("../access");
/** Thrown when an authorization check fails. Map this to an HttpsError in your handler. */
class RoleAuthError extends Error {
    constructor(message, code = 'permission-denied') {
        super(message);
        this.code = code;
        this.name = 'RoleAuthError';
    }
}
exports.RoleAuthError = RoleAuthError;
/** Throws RoleAuthError('unauthenticated') when there is no authenticated caller. */
function assertAuthenticated(auth) {
    if (!auth || !auth.uid) {
        throw new RoleAuthError('You must be signed in to perform this action.', 'unauthenticated');
    }
}
/** Throws unless the caller's `role` claim is one of `roles`. */
function assertRole(auth, roles) {
    assertAuthenticated(auth);
    const allowed = Array.isArray(roles) ? roles : [roles];
    const callerRole = auth.token?.role;
    if (typeof callerRole !== 'string' || !allowed.includes(callerRole)) {
        throw new RoleAuthError(`Requires role: ${allowed.join(' or ')}.`, 'permission-denied');
    }
}
/**
 * Build the body of a callable that lets an admin set another user's role and/or
 * permissions. Returns an async fn you drop into your callable definition.
 *
 * 2nd-gen example:
 *   export const setRole = onCall(async (req) =>
 *     makeSetRoleCallable()( req.data, req.auth
 *       ? { uid: req.auth.uid, token: req.auth.token } : undefined ));
 *
 * 1st-gen example:
 *   export const setRole = functions.https.onCall((data, context) =>
 *     makeSetRoleCallable()( data, context.auth
 *       ? { uid: context.auth.uid, token: context.auth.token } : undefined ));
 */
function makeSetRoleCallable(options = {}) {
    const adminRoles = options.adminRoles ?? ['superadmin'];
    const admin = options.roleAdmin ?? new roleAdmin_1.RoleAdmin();
    return async (data, auth) => {
        assertRole(auth, adminRoles);
        if (!data || (!data.uid && !data.email)) {
            throw new RoleAuthError('Provide a `uid` or `email` to target.', 'invalid-argument');
        }
        let uid = data.uid;
        if (!uid && data.email) {
            uid = await admin.setRoleByEmail(data.email, data.role ?? null);
            if (data.permissions !== undefined)
                await admin.setPermissions(uid, data.permissions);
            return { uid, role: data.role ?? null, permissions: data.permissions };
        }
        const grant = {};
        if ('role' in data)
            grant.role = data.role ?? null;
        if (data.permissions !== undefined)
            grant.permissions = data.permissions;
        await admin.grant(uid, grant);
        return { uid: uid, role: grant.role, permissions: grant.permissions };
    };
}
/**
 * Build the body of the callable that manages tiers: platform roles, per-app roles and store / team roles.
 * Who may change what is decided by `authorizeChange` (super admin: everything; app admin: stores of their app;
 * store owner: managers and staff of their own store). The caller's access is read from Firebase right now, not
 * from their ID token, so a demoted admin cannot keep granting access until the token expires.
 *
 *   export const changeAccess = onCall(async (req) =>
 *     makeChangeAccessCallable()(req.data, req.auth ? { uid: req.auth.uid, token: req.auth.token } : undefined));
 */
function makeChangeAccessCallable(options = {}) {
    const admin = options.roleAdmin ?? new roleAdmin_1.RoleAdmin();
    return async (data, auth) => {
        assertAuthenticated(auth);
        if (!data || (!data.uid && !data.email))
            throw new RoleAuthError('Provide a `uid` or `email` to target.', 'invalid-argument');
        const { uid: _u, email: _e, ...change } = data;
        const malformed = (0, access_1.validateChange)(change);
        if (malformed)
            throw new RoleAuthError(malformed, 'invalid-argument'); // a bad request is not a permissions problem
        try {
            const targetUid = data.uid ?? (await admin.uidForEmail(data.email));
            const [callerRaw, targetRaw] = await Promise.all([admin.getClaims(auth.uid), admin.getClaims(targetUid)]);
            const decision = (0, access_1.authorizeChange)({ uid: auth.uid, claims: (0, access_1.parseClaims)(callerRaw) }, { uid: targetUid, claims: (0, access_1.parseClaims)(targetRaw) }, change);
            if (!decision.ok)
                throw new RoleAuthError(decision.reason, 'permission-denied');
            const { claims, revoked } = await admin.applyAccessChange(targetUid, change);
            const out = (0, access_1.parseClaims)(claims);
            return { uid: targetUid, role: out.role, apps: out.apps, tenants: out.tenants, sessionsRevoked: revoked };
        }
        catch (err) {
            if (err instanceof access_1.AccessError)
                throw new RoleAuthError(err.message, 'invalid-argument');
            throw err;
        }
    };
}
/**
 * Build a handler for the Firebase Auth `onCreate` trigger that stamps a default
 * role on every newly-created user.
 *
 * 1st-gen example:
 *   export const onUserCreate = functions.auth.user()
 *     .onCreate(makeAssignDefaultRoleTrigger({ defaultRole: 'user' }));
 */
function makeAssignDefaultRoleTrigger(options = {}) {
    const defaultRole = options.defaultRole ?? 'user';
    const admin = options.roleAdmin ?? new roleAdmin_1.RoleAdmin();
    return async (user) => {
        await admin.setRole(user.uid, defaultRole);
    };
}
