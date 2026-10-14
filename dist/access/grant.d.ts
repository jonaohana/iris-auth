import { AccessClaims, AppRole, TenantRole } from './claims';
export interface AccessChange {
    /** 'superadmin' | 'admin' | 'user' | custom; null removes the role. */
    role?: string | null;
    /** app → role; null removes that app. */
    apps?: Record<string, AppRole | null>;
    /** '<app>/<id>' → role; null removes it. */
    tenants?: Record<string, TenantRole | null>;
}
export interface Actor {
    uid: string;
    claims: AccessClaims;
}
/** `reason` is set whenever `ok` is false. (A plain shape, not a union: the package compiles without strictNullChecks.) */
export interface Decision {
    ok: boolean;
    reason?: string;
}
/** Shape check only — says nothing about who is asking. */
export declare function validateChange(change: AccessChange): string | null;
/**
 * May `caller` apply `change` to `target`?
 *  - super admin: anything, except changing their own platform role (no accidental self-lockout).
 *  - platform roles and app roles: super admin only.
 *  - tenant roles: super admin, an admin of that tenant's app, or an owner of that tenant
 *    (an owner may add or remove managers and staff, never owners).
 *  - nobody but a super admin may touch a super admin.
 */
export declare function authorizeChange(caller: Actor, target: Actor, change: AccessChange): Decision;
/**
 * True when `after` gives the user less than `before` (a role dropped, an app or store role removed or lowered).
 * Removing access should also end the user's existing sessions, because their old token keeps working for up to an hour.
 */
export declare function reducesAccess(before: AccessClaims, after: AccessClaims): boolean;
/**
 * Merge `change` into the user's existing raw claims, keeping every unrelated claim.
 * Throws AccessError if the result would exceed Firebase's 1000-byte claims limit.
 */
export declare function applyChange(existing: Record<string, any> | null | undefined, change: AccessChange): Record<string, any>;
//# sourceMappingURL=grant.d.ts.map