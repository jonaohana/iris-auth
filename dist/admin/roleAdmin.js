"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleAdmin = exports.PERMISSIONS_CLAIM = exports.ROLE_CLAIM = void 0;
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
const auth_1 = require("firebase-admin/auth");
/** Custom-claim key holding the user's primary role. */
exports.ROLE_CLAIM = 'role';
/** Custom-claim key holding the user's granular permissions array. */
exports.PERMISSIONS_CLAIM = 'permissions';
/**
 * Thin, merge-safe wrapper over the Firebase Admin Auth API for managing role
 * and permission custom claims. Every mutation reads the user's existing claims
 * first and merges, so setting a role never clobbers unrelated claims.
 *
 * Remember: after any change here, the affected user's ID token must refresh
 * before the new claim is visible. On the client call `refreshUser()` from
 * `useAuth()` (or sign out / back in). Existing tokens stay valid up to ~1 hour.
 */
class RoleAdmin {
    /** @param app Optional firebase-admin App. Defaults to the initialized default app. */
    constructor(app) {
        this.auth = (0, auth_1.getAuth)(app);
    }
    /** All custom claims currently on the user (never null). */
    async getClaims(uid) {
        const user = await this.auth.getUser(uid);
        return { ...(user.customClaims || {}) };
    }
    /** The user's current primary role, or null. */
    async getRole(uid) {
        const claims = await this.getClaims(uid);
        return typeof claims[exports.ROLE_CLAIM] === 'string' ? claims[exports.ROLE_CLAIM] : null;
    }
    /** The user's current permissions array (empty when none). */
    async getPermissions(uid) {
        const claims = await this.getClaims(uid);
        return Array.isArray(claims[exports.PERMISSIONS_CLAIM]) ? claims[exports.PERMISSIONS_CLAIM] : [];
    }
    /** Set (or clear, with null) the user's primary role, preserving other claims. */
    async setRole(uid, role) {
        const claims = await this.getClaims(uid);
        if (role === null) {
            delete claims[exports.ROLE_CLAIM];
        }
        else {
            claims[exports.ROLE_CLAIM] = role;
        }
        await this.auth.setCustomUserClaims(uid, claims);
    }
    /** Look the user up by email, then set their role. */
    async setRoleByEmail(email, role) {
        const user = await this.auth.getUserByEmail(email);
        await this.setRole(user.uid, role);
        return user.uid;
    }
    /** Replace the user's permissions array, preserving other claims. */
    async setPermissions(uid, permissions) {
        const claims = await this.getClaims(uid);
        claims[exports.PERMISSIONS_CLAIM] = Array.from(new Set(permissions));
        await this.auth.setCustomUserClaims(uid, claims);
    }
    /** Add one or more permissions (idempotent). */
    async addPermissions(uid, ...permissions) {
        const current = await this.getPermissions(uid);
        await this.setPermissions(uid, [...current, ...permissions]);
    }
    /** Remove one or more permissions (idempotent). */
    async removePermissions(uid, ...permissions) {
        const remove = new Set(permissions);
        const current = await this.getPermissions(uid);
        await this.setPermissions(uid, current.filter((p) => !remove.has(p)));
    }
    /** Set role and/or permissions together in a single write. */
    async grant(uid, grant) {
        const claims = await this.getClaims(uid);
        if ('role' in grant) {
            if (grant.role === null || grant.role === undefined) {
                delete claims[exports.ROLE_CLAIM];
            }
            else {
                claims[exports.ROLE_CLAIM] = grant.role;
            }
        }
        if (grant.permissions !== undefined) {
            claims[exports.PERMISSIONS_CLAIM] = Array.from(new Set(grant.permissions));
        }
        await this.auth.setCustomUserClaims(uid, claims);
    }
    /** Remove all role/permission claims (leaves any unrelated claims intact). */
    async clear(uid) {
        const claims = await this.getClaims(uid);
        delete claims[exports.ROLE_CLAIM];
        delete claims[exports.PERMISSIONS_CLAIM];
        await this.auth.setCustomUserClaims(uid, claims);
    }
}
exports.RoleAdmin = RoleAdmin;
