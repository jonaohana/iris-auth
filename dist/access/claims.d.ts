export declare const SUPER_ADMIN_ROLE = "superadmin";
export declare const APP_ROLES: readonly ["staff", "admin"];
export declare const TENANT_ROLES: readonly ["staff", "manager", "owner"];
export type AppRole = (typeof APP_ROLES)[number];
export type TenantRole = (typeof TENANT_ROLES)[number];
/** Firebase rejects custom claims larger than this many bytes of JSON. */
export declare const CLAIMS_MAX_BYTES = 1000;
export interface AccessClaims {
    role: string | null;
    apps: Record<string, AppRole>;
    /** Keyed `<app>/<id>`, e.g. `ganjahub/cmuaz5exm000311w7ckkrh63o`. */
    tenants: Record<string, TenantRole>;
    permissions: string[];
}
export declare class AccessError extends Error {
    code: 'invalid' | 'forbidden' | 'too-large';
    constructor(message: string, code?: 'invalid' | 'forbidden' | 'too-large');
}
export declare const NAME_RE: RegExp;
export declare const ID_RE: RegExp;
export declare const isAppRole: (v: unknown) => v is AppRole;
export declare const isTenantRole: (v: unknown) => v is TenantRole;
/** Higher = more powerful. */
export declare const appRank: (r: AppRole) => number;
export declare const tenantRank: (r: TenantRole) => number;
export declare const tenantKey: (app: string, id: string) => string;
export declare function splitTenantKey(key: string): {
    app: string;
    id: string;
} | null;
/** Normalise raw custom claims (or a verified ID token) into AccessClaims, dropping anything malformed. */
export declare function parseClaims(raw: Record<string, any> | null | undefined): AccessClaims;
/** UTF-8 size of the claims as Firebase measures them (no TextEncoder: it is missing on older React Native). */
export declare function claimsBytes(raw: unknown): number;
export declare const isSuperAdmin: (c: AccessClaims | null | undefined) => boolean;
/** Super admins pass. Otherwise an explicit `apps[app]` at or above `min`, or a legacy global `role: 'admin'`. */
export declare function hasAppRole(c: AccessClaims | null | undefined, app: string, min?: AppRole): boolean;
/**
 * Super admins pass. Otherwise the user must hold an explicit role on that store/team at or above `min`.
 * Being an app admin does NOT imply this: apps decide whether their admins may act inside a tenant.
 */
export declare function hasTenantRole(c: AccessClaims | null | undefined, app: string, id: string, min?: TenantRole): boolean;
/** The tenants of `app` the user belongs to, with their role on each. */
export declare function tenantsOf(c: AccessClaims | null | undefined, app: string): {
    id: string;
    role: TenantRole;
}[];
//# sourceMappingURL=claims.d.ts.map