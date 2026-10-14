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
import { type Auth as AdminAuth } from 'firebase-admin/auth';
import type { App } from 'firebase-admin/app';
import { AccessChange } from '../access';
/** Custom-claim key holding the user's primary role. */
export declare const ROLE_CLAIM = "role";
/** Custom-claim key holding the user's granular permissions array. */
export declare const PERMISSIONS_CLAIM = "permissions";
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
export declare class RoleAdmin {
    private auth;
    /**
     * @param app  Optional firebase-admin App. Defaults to the initialized default app.
     * @param auth Optional Auth instance to use instead (tests pass a fake).
     */
    constructor(app?: App, auth?: AdminAuth);
    /** All custom claims currently on the user (never null). */
    getClaims(uid: string): Promise<Record<string, any>>;
    /** The user's current primary role, or null. */
    getRole(uid: string): Promise<string | null>;
    /** The user's current permissions array (empty when none). */
    getPermissions(uid: string): Promise<string[]>;
    /** Set (or clear, with null) the user's primary role, preserving other claims. */
    setRole(uid: string, role: string | null): Promise<void>;
    /** Look the user up by email, then set their role. */
    setRoleByEmail(email: string, role: string | null): Promise<string>;
    /** Replace the user's permissions array, preserving other claims. */
    setPermissions(uid: string, permissions: string[]): Promise<void>;
    /** Add one or more permissions (idempotent). */
    addPermissions(uid: string, ...permissions: string[]): Promise<void>;
    /** Remove one or more permissions (idempotent). */
    removePermissions(uid: string, ...permissions: string[]): Promise<void>;
    /** Set role and/or permissions together in a single write. */
    grant(uid: string, grant: RoleGrant): Promise<void>;
    /** The uid for an email address (throws if there is no such user). */
    uidForEmail(email: string): Promise<string>;
    /**
     * Apply a tier change (platform role, app roles, store / team roles) to a user. This does NOT decide whether the
     * caller is allowed to: run `authorizeChange` first (the callable from `makeChangeAccessCallable` does).
     * When the change takes access away, the user's refresh tokens are revoked so it takes effect at once,
     * not after their current token expires.
     */
    applyAccessChange(uid: string, change: AccessChange): Promise<{
        claims: Record<string, any>;
        revoked: boolean;
    }>;
    /** Remove all role/permission claims (leaves any unrelated claims intact). */
    clear(uid: string): Promise<void>;
}
//# sourceMappingURL=roleAdmin.d.ts.map