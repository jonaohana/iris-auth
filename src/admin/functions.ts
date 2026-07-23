/**
 * SERVER-ONLY. Framework-light helpers for wiring role management into Firebase
 * Cloud Functions. These intentionally do NOT import `firebase-functions`, so
 * this package stays free of that dependency — you pass in the callable
 * `data`/`context` (or the created `user`) from your own function definition.
 *
 * Works with both 1st-gen and 2nd-gen callable signatures (see ROLES.md).
 */
import { RoleAdmin, RoleGrant } from './roleAdmin';

/** A minimal shape of the auth info Cloud Functions attaches to a callable. */
export interface CallableAuthLike {
  uid: string;
  token: Record<string, any>;
}

/** Thrown when an authorization check fails. Map this to an HttpsError in your handler. */
export class RoleAuthError extends Error {
  constructor(
    message: string,
    public code: 'unauthenticated' | 'permission-denied' | 'invalid-argument' = 'permission-denied',
  ) {
    super(message);
    this.name = 'RoleAuthError';
  }
}

/** Throws RoleAuthError('unauthenticated') when there is no authenticated caller. */
export function assertAuthenticated(auth: CallableAuthLike | undefined | null): asserts auth is CallableAuthLike {
  if (!auth || !auth.uid) {
    throw new RoleAuthError('You must be signed in to perform this action.', 'unauthenticated');
  }
}

/** Throws unless the caller's `role` claim is one of `roles`. */
export function assertRole(auth: CallableAuthLike | undefined | null, roles: string | string[]): void {
  assertAuthenticated(auth);
  const allowed = Array.isArray(roles) ? roles : [roles];
  const callerRole = auth.token?.role;
  if (typeof callerRole !== 'string' || !allowed.includes(callerRole)) {
    throw new RoleAuthError(`Requires role: ${allowed.join(' or ')}.`, 'permission-denied');
  }
}

export interface SetRoleData {
  uid?: string;
  email?: string;
  role?: string | null;
  permissions?: string[];
}

export interface SetRoleCallableOptions {
  /** Roles allowed to assign roles to others. Default `['admin']`. */
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
export function makeSetRoleCallable(options: SetRoleCallableOptions = {}) {
  const adminRoles = options.adminRoles ?? ['admin'];
  const admin = options.roleAdmin ?? new RoleAdmin();

  return async (
    data: SetRoleData,
    auth: CallableAuthLike | undefined | null,
  ): Promise<{ uid: string; role?: string | null; permissions?: string[] }> => {
    assertRole(auth, adminRoles);

    if (!data || (!data.uid && !data.email)) {
      throw new RoleAuthError('Provide a `uid` or `email` to target.', 'invalid-argument');
    }

    let uid = data.uid;
    if (!uid && data.email) {
      uid = await admin.setRoleByEmail(data.email, data.role ?? null);
      if (data.permissions !== undefined) await admin.setPermissions(uid, data.permissions);
      return { uid, role: data.role ?? null, permissions: data.permissions };
    }

    const grant: RoleGrant = {};
    if ('role' in data) grant.role = data.role ?? null;
    if (data.permissions !== undefined) grant.permissions = data.permissions;
    await admin.grant(uid as string, grant);
    return { uid: uid as string, role: grant.role, permissions: grant.permissions };
  };
}

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
export function makeAssignDefaultRoleTrigger(options: AssignDefaultRoleOptions = {}) {
  const defaultRole = options.defaultRole ?? 'user';
  const admin = options.roleAdmin ?? new RoleAdmin();
  return async (user: { uid: string }): Promise<void> => {
    await admin.setRole(user.uid, defaultRole);
  };
}
