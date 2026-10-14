// ============================================================================
// Access tiers — the shared definition of who may do what, read from Firebase custom claims.
//
//   super admin   role: 'superadmin'                          everything, everywhere
//   app admin     apps:    { ganjahub: 'admin' }               admin of that app only
//   tenant roles  tenants: { 'ganjahub/<storeId>': 'owner' }  one store / team / org inside an app
//   everyone else role: 'user' (or none)
//
// Pure functions, no Firebase or React imports: the client, Cloud Functions and every backend use this file.
// One Firebase project serves all iris apps, so every grant is scoped by app name — a bare `role: 'admin'` would
// be admin everywhere. (`role: 'admin'` is still honoured as "admin of every app" for older claims.)
// ============================================================================

export const SUPER_ADMIN_ROLE = 'superadmin';
export const APP_ROLES = ['staff', 'admin'] as const;
export const TENANT_ROLES = ['staff', 'manager', 'owner'] as const;
export type AppRole = (typeof APP_ROLES)[number];
export type TenantRole = (typeof TENANT_ROLES)[number];

/** Firebase rejects custom claims larger than this many bytes of JSON. */
export const CLAIMS_MAX_BYTES = 1000;

export interface AccessClaims {
  role: string | null;
  apps: Record<string, AppRole>;
  /** Keyed `<app>/<id>`, e.g. `ganjahub/cmuaz5exm000311w7ckkrh63o`. */
  tenants: Record<string, TenantRole>;
  permissions: string[];
}

export class AccessError extends Error {
  constructor(message: string, public code: 'invalid' | 'forbidden' | 'too-large' = 'invalid') {
    super(message);
    this.name = 'AccessError';
  }
}

export const NAME_RE = /^[a-z][a-z0-9_-]{0,31}$/;
export const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

export const isAppRole = (v: unknown): v is AppRole => (APP_ROLES as readonly unknown[]).includes(v);
export const isTenantRole = (v: unknown): v is TenantRole => (TENANT_ROLES as readonly unknown[]).includes(v);

/** Higher = more powerful. */
export const appRank = (r: AppRole): number => APP_ROLES.indexOf(r);
export const tenantRank = (r: TenantRole): number => TENANT_ROLES.indexOf(r);

export const tenantKey = (app: string, id: string): string => app + '/' + id;

export function splitTenantKey(key: string): { app: string; id: string } | null {
  const i = key.indexOf('/');
  if (i <= 0) return null;
  const app = key.slice(0, i);
  const id = key.slice(i + 1);
  return NAME_RE.test(app) && ID_RE.test(id) ? { app, id } : null;
}

/** Normalise raw custom claims (or a verified ID token) into AccessClaims, dropping anything malformed. */
export function parseClaims(raw: Record<string, any> | null | undefined): AccessClaims {
  const src = raw || {};
  const apps: Record<string, AppRole> = {};
  const tenants: Record<string, TenantRole> = {};
  if (src.apps && typeof src.apps === 'object') {
    for (const [k, v] of Object.entries(src.apps)) if (NAME_RE.test(k) && isAppRole(v)) apps[k] = v;
  }
  if (src.tenants && typeof src.tenants === 'object') {
    for (const [k, v] of Object.entries(src.tenants)) if (splitTenantKey(k) && isTenantRole(v)) tenants[k] = v;
  }
  return {
    role: typeof src.role === 'string' ? src.role : null,
    apps,
    tenants,
    permissions: Array.isArray(src.permissions) ? src.permissions.filter((p: unknown): p is string => typeof p === 'string') : [],
  };
}

/** UTF-8 size of the claims as Firebase measures them (no TextEncoder: it is missing on older React Native). */
export function claimsBytes(raw: unknown): number {
  const json = JSON.stringify(raw ?? {});
  let bytes = 0;
  for (let i = 0; i < json.length; i++) {
    const c = json.charCodeAt(i);
    if (c < 0x80) bytes += 1;
    else if (c < 0x800) bytes += 2;
    else if (c >= 0xd800 && c <= 0xdbff) { bytes += 4; i++; } // surrogate pair
    else bytes += 3;
  }
  return bytes;
}

export const isSuperAdmin = (c: AccessClaims | null | undefined): boolean => !!c && c.role === SUPER_ADMIN_ROLE;

/** Super admins pass. Otherwise an explicit `apps[app]` at or above `min`, or a legacy global `role: 'admin'`. */
export function hasAppRole(c: AccessClaims | null | undefined, app: string, min: AppRole = 'admin'): boolean {
  if (!c) return false;
  if (isSuperAdmin(c) || c.role === 'admin') return true;
  const have = c.apps[app];
  return !!have && appRank(have) >= appRank(min);
}

/**
 * Super admins pass. Otherwise the user must hold an explicit role on that store/team at or above `min`.
 * Being an app admin does NOT imply this: apps decide whether their admins may act inside a tenant.
 */
export function hasTenantRole(c: AccessClaims | null | undefined, app: string, id: string, min: TenantRole = 'staff'): boolean {
  if (!c) return false;
  if (isSuperAdmin(c)) return true;
  const have = c.tenants[tenantKey(app, id)];
  return !!have && tenantRank(have) >= tenantRank(min);
}

/** The tenants of `app` the user belongs to, with their role on each. */
export function tenantsOf(c: AccessClaims | null | undefined, app: string): { id: string; role: TenantRole }[] {
  if (!c) return [];
  const out: { id: string; role: TenantRole }[] = [];
  for (const [k, role] of Object.entries(c.tenants)) {
    const parts = splitTenantKey(k);
    if (parts && parts.app === app) out.push({ id: parts.id, role });
  }
  return out;
}
