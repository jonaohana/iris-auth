/**
 * SERVER-ONLY. Framework-light helpers for wiring role management into Firebase
 * Cloud Functions. These intentionally do NOT import `firebase-functions`, so
 * this package stays free of that dependency — you pass in the callable
 * `data`/`context` (or the created `user`) from your own function definition.
 *
 * Works with both 1st-gen and 2nd-gen callable signatures (see ROLES.md).
 */
import { RoleAdmin } from './roleAdmin';
import { AccessChange } from '../access';
/** A minimal shape of the auth info Cloud Functions attaches to a callable. */
export interface CallableAuthLike {
    uid: string;
    token: Record<string, any>;
}
/** Thrown when an authorization check fails. Map this to an HttpsError in your handler. */
export declare class RoleAuthError extends Error {
    code: 'unauthenticated' | 'permission-denied' | 'invalid-argument';
    constructor(message: string, code?: 'unauthenticated' | 'permission-denied' | 'invalid-argument');
}
/** Throws RoleAuthError('unauthenticated') when there is no authenticated caller. */
export declare function assertAuthenticated(auth: CallableAuthLike | undefined | null): asserts auth is CallableAuthLike;
/** Throws unless the caller's `role` claim is one of `roles`. */
export declare function assertRole(auth: CallableAuthLike | undefined | null, roles: string | string[]): void;
export interface SetRoleData {
    uid?: string;
    email?: string;
    role?: string | null;
    permissions?: string[];
}
export interface SetRoleCallableOptions {
    /** Roles allowed to assign platform roles to others. Default `['superadmin']` (a bare admin could otherwise mint super admins). */
    adminRoles?: string[];
    /** Provide a RoleAdmin instance; defaults to `new RoleAdmin()` (default app). */
    roleAdmin?: RoleAdmin;
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
export declare function makeSetRoleCallable(options?: SetRoleCallableOptions): (data: SetRoleData, auth: CallableAuthLike | undefined | null) => Promise<{
    uid: string;
    role?: string | null;
    permissions?: string[];
}>;
export interface ChangeAccessData extends AccessChange {
    uid?: string;
    email?: string;
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
export declare function makeChangeAccessCallable(options?: {
    roleAdmin?: RoleAdmin;
}): (data: ChangeAccessData, auth: CallableAuthLike | undefined | null) => Promise<{
    uid: string;
    role: string;
    apps: Record<string, "staff" | "admin">;
    tenants: Record<string, "staff" | "manager" | "owner">;
    sessionsRevoked: boolean;
}>;
export interface AssignDefaultRoleOptions {
    /** Role assigned to every new user. Default `'user'`. */
    defaultRole?: string;
    /** Provide a RoleAdmin instance; defaults to `new RoleAdmin()`. */
    roleAdmin?: RoleAdmin;
}
/**
 * Build a handler for the Firebase Auth `onCreate` trigger that stamps a default
 * role on every newly-created user.
 *
 * 1st-gen example:
 *   export const onUserCreate = functions.auth.user()
 *     .onCreate(makeAssignDefaultRoleTrigger({ defaultRole: 'user' }));
 */
export declare function makeAssignDefaultRoleTrigger(options?: AssignDefaultRoleOptions): (user: {
    uid: string;
}) => Promise<void>;
//# sourceMappingURL=functions.d.ts.map