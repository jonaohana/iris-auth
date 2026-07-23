/**
 * SERVER-ONLY. Never import this from client / React Native code — it depends
 * on `firebase-admin`, which requires a service-account secret and does not
 * bundle for web or native.
 *
 * Import it from the dedicated subpath export:
 *
 *   import { RoleAdmin } from '@iris/auth/admin';
 *
 * `firebase-admin` is an *optional* peer dependency — install it in the
 * project that uses this (e.g. your Cloud Functions package).
 */
import { getAuth, type Auth as AdminAuth } from 'firebase-admin/auth';
import type { App } from 'firebase-admin/app';

/** Custom-claim key holding the user's primary role. */
export const ROLE_CLAIM = 'role';
/** Custom-claim key holding the user's granular permissions array. */
export const PERMISSIONS_CLAIM = 'permissions';

export interface RoleGrant {
  role?: string | null;
  permissions?: string[];
}

/**
 * Thin, merge-safe wrapper over the Firebase Admin Auth API for managing role
 * and permission custom claims. Every mutation reads the user's existing claims
 * first and merges, so setting a role never clobbers unrelated claims.
 *
 * Remember: after any change here, the affected user's ID token must refresh
 * before the new claim is visible. On the client call `refreshUser()` from
 * `useAuth()` (or sign out / back in). Existing tokens stay valid up to ~1 hour.
 */
export class RoleAdmin {
  private auth: AdminAuth;

  /** @param app Optional firebase-admin App. Defaults to the initialized default app. */
  constructor(app?: App) {
    this.auth = getAuth(app);
  }

  /** All custom claims currently on the user (never null). */
  async getClaims(uid: string): Promise<Record<string, any>> {
    const user = await this.auth.getUser(uid);
    return { ...(user.customClaims || {}) };
  }

  /** The user's current primary role, or null. */
  async getRole(uid: string): Promise<string | null> {
    const claims = await this.getClaims(uid);
    return typeof claims[ROLE_CLAIM] === 'string' ? claims[ROLE_CLAIM] : null;
  }

  /** The user's current permissions array (empty when none). */
  async getPermissions(uid: string): Promise<string[]> {
    const claims = await this.getClaims(uid);
    return Array.isArray(claims[PERMISSIONS_CLAIM]) ? claims[PERMISSIONS_CLAIM] : [];
  }

  /** Set (or clear, with null) the user's primary role, preserving other claims. */
  async setRole(uid: string, role: string | null): Promise<void> {
    const claims = await this.getClaims(uid);
    if (role === null) {
      delete claims[ROLE_CLAIM];
    } else {
      claims[ROLE_CLAIM] = role;
    }
    await this.auth.setCustomUserClaims(uid, claims);
  }

  /** Look the user up by email, then set their role. */
  async setRoleByEmail(email: string, role: string | null): Promise<string> {
    const user = await this.auth.getUserByEmail(email);
    await this.setRole(user.uid, role);
    return user.uid;
  }

  /** Replace the user's permissions array, preserving other claims. */
  async setPermissions(uid: string, permissions: string[]): Promise<void> {
    const claims = await this.getClaims(uid);
    claims[PERMISSIONS_CLAIM] = Array.from(new Set(permissions));
    await this.auth.setCustomUserClaims(uid, claims);
  }

  /** Add one or more permissions (idempotent). */
  async addPermissions(uid: string, ...permissions: string[]): Promise<void> {
    const current = await this.getPermissions(uid);
    await this.setPermissions(uid, [...current, ...permissions]);
  }

  /** Remove one or more permissions (idempotent). */
  async removePermissions(uid: string, ...permissions: string[]): Promise<void> {
    const remove = new Set(permissions);
    const current = await this.getPermissions(uid);
    await this.setPermissions(uid, current.filter((p) => !remove.has(p)));
  }

  /** Set role and/or permissions together in a single write. */
  async grant(uid: string, grant: RoleGrant): Promise<void> {
    const claims = await this.getClaims(uid);
    if ('role' in grant) {
      if (grant.role === null || grant.role === undefined) {
        delete claims[ROLE_CLAIM];
      } else {
        claims[ROLE_CLAIM] = grant.role;
      }
    }
    if (grant.permissions !== undefined) {
      claims[PERMISSIONS_CLAIM] = Array.from(new Set(grant.permissions));
    }
    await this.auth.setCustomUserClaims(uid, claims);
  }

  /** Remove all role/permission claims (leaves any unrelated claims intact). */
  async clear(uid: string): Promise<void> {
    const claims = await this.getClaims(uid);
    delete claims[ROLE_CLAIM];
    delete claims[PERMISSIONS_CLAIM];
    await this.auth.setCustomUserClaims(uid, claims);
  }
}
