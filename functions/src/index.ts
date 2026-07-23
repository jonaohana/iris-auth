/**
 * Cloud Functions for @iris/auth role management.
 *
 * - `setRole`: callable an admin uses to set another user's role/permissions.
 * - `assignDefaultRole`: Auth onCreate trigger stamping a default role.
 *
 * This mirrors the claim contract of `@iris/auth/admin` (claims `role` and
 * `permissions`) but is kept self-contained so it deploys with no cross-package
 * setup. Once `@iris/auth` is published to your registry you can replace the
 * inline logic with `import { makeSetRoleCallable, makeAssignDefaultRoleTrigger }
 * from '@iris/auth/admin'`.
 */
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import * as functionsV1 from 'firebase-functions/v1';

initializeApp();

const ROLE_CLAIM = 'role';
const PERMISSIONS_CLAIM = 'permissions';

/** Roles allowed to assign roles to other users. */
const ADMIN_ROLES = ['admin'];
/** Role stamped on every newly-created user. */
const DEFAULT_ROLE = 'user';

interface SetRoleData {
  uid?: string;
  email?: string;
  role?: string | null;
  permissions?: string[];
}

export const setRole = onCall(async (req: CallableRequest<SetRoleData>) => {
  const token = req.auth?.token as Record<string, any> | undefined;
  if (!req.auth || !token) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }
  if (typeof token.role !== 'string' || !ADMIN_ROLES.includes(token.role)) {
    throw new HttpsError('permission-denied', 'Requires an admin role.');
  }

  const data: SetRoleData = req.data || {};
  const { uid, email, role, permissions } = data;
  if (!uid && !email) {
    throw new HttpsError('invalid-argument', 'Provide a `uid` or `email`.');
  }

  const auth = getAuth();
  const user = uid ? await auth.getUser(uid) : await auth.getUserByEmail(email as string);

  const claims: Record<string, any> = { ...(user.customClaims || {}) };
  if (role === null) {
    delete claims[ROLE_CLAIM];
  } else if (role !== undefined) {
    claims[ROLE_CLAIM] = role;
  }
  if (permissions !== undefined) {
    claims[PERMISSIONS_CLAIM] = Array.from(new Set(permissions));
  }

  await auth.setCustomUserClaims(user.uid, claims);
  return {
    uid: user.uid,
    role: claims[ROLE_CLAIM] ?? null,
    permissions: claims[PERMISSIONS_CLAIM] ?? [],
  };
});

export const assignDefaultRole = functionsV1.auth.user().onCreate(async (user) => {
  await getAuth().setCustomUserClaims(user.uid, { [ROLE_CLAIM]: DEFAULT_ROLE });
});
