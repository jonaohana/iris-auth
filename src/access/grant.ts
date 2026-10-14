// Who may change whose access, and how a change is applied to the raw claims. Pure: no Firebase, no I/O.
// The Cloud Function / RoleAdmin call authorizeChange() first and applyChange() second.
import {
  AccessClaims, AccessError, AppRole, TenantRole, CLAIMS_MAX_BYTES, NAME_RE,
  appRank, claimsBytes, hasAppRole, isAppRole, isSuperAdmin, isTenantRole, splitTenantKey, tenantRank,
} from './claims';

export interface AccessChange {
  /** 'superadmin' | 'admin' | 'user' | custom; null removes the role. */
  role?: string | null;
  /** app → role; null removes that app. */
  apps?: Record<string, AppRole | null>;
  /** '<app>/<id>' → role; null removes it. */
  tenants?: Record<string, TenantRole | null>;
}

export interface Actor { uid: string; claims: AccessClaims }
/** `reason` is set whenever `ok` is false. (A plain shape, not a union: the package compiles without strictNullChecks.) */
export interface Decision { ok: boolean; reason?: string }

const no = (reason: string): Decision => ({ ok: false, reason });
const ROLE_RE = NAME_RE;

/** Shape check only — says nothing about who is asking. */
export function validateChange(change: AccessChange): string | null {
  if (!change || typeof change !== 'object') return 'Missing change.';
  if (change.role !== undefined && change.role !== null && !ROLE_RE.test(change.role)) return 'Invalid role name.';
  for (const [app, r] of Object.entries(change.apps ?? {})) {
    if (!NAME_RE.test(app)) return 'Invalid app name: ' + app;
    if (r !== null && !isAppRole(r)) return 'Invalid app role for ' + app + '.';
  }
  for (const [key, r] of Object.entries(change.tenants ?? {})) {
    if (!splitTenantKey(key)) return 'Invalid tenant key (use app/id): ' + key;
    if (r !== null && !isTenantRole(r)) return 'Invalid tenant role for ' + key + '.';
  }
  if (change.role === undefined && !change.apps && !change.tenants) return 'Nothing to change.';
  return null;
}

/**
 * May `caller` apply `change` to `target`?
 *  - super admin: anything, except changing their own platform role (no accidental self-lockout).
 *  - platform roles and app roles: super admin only.
 *  - tenant roles: super admin, an admin of that tenant's app, or an owner of that tenant
 *    (an owner may add or remove managers and staff, never owners).
 *  - nobody but a super admin may touch a super admin.
 */
export function authorizeChange(caller: Actor, target: Actor, change: AccessChange): Decision {
  const bad = validateChange(change);
  if (bad) return no(bad);
  const callerIsSuper = isSuperAdmin(caller.claims);

  if (callerIsSuper) {
    if (change.role !== undefined && caller.uid === target.uid) return no('You cannot change your own role.');
    return { ok: true };
  }
  if (isSuperAdmin(target.claims)) return no('Only a super admin can change a super admin.');
  if (change.role !== undefined) return no('Only a super admin can change platform roles.');
  if (change.apps && Object.keys(change.apps).length) return no('Only a super admin can change app roles.');

  for (const [key, next] of Object.entries(change.tenants ?? {})) {
    const { app } = splitTenantKey(key)!;
    if (hasAppRole(caller.claims, app, 'admin')) continue;
    if (caller.claims.tenants[key] === 'owner') {
      if (next === 'owner') return no('Only a super admin or the app admin can make someone an owner.');
      if (target.claims.tenants[key] === 'owner') return no('An owner cannot change another owner.');
      continue;
    }
    return no('You do not manage ' + key + '.');
  }
  return { ok: true };
}

/**
 * True when `after` gives the user less than `before` (a role dropped, an app or store role removed or lowered).
 * Removing access should also end the user's existing sessions, because their old token keeps working for up to an hour.
 */
export function reducesAccess(before: AccessClaims, after: AccessClaims): boolean {
  const platformRank = (r: string | null) => (r === 'superadmin' ? 2 : r === 'admin' ? 1 : 0);
  if (platformRank(after.role) < platformRank(before.role)) return true;
  for (const [app, r] of Object.entries(before.apps)) {
    const now = after.apps[app];
    if (!now || appRank(now) < appRank(r)) return true;
  }
  for (const [key, r] of Object.entries(before.tenants)) {
    const now = after.tenants[key];
    if (!now || tenantRank(now) < tenantRank(r)) return true;
  }
  return false;
}

/**
 * Merge `change` into the user's existing raw claims, keeping every unrelated claim.
 * Throws AccessError if the result would exceed Firebase's 1000-byte claims limit.
 */
export function applyChange(existing: Record<string, any> | null | undefined, change: AccessChange): Record<string, any> {
  const bad = validateChange(change);
  if (bad) throw new AccessError(bad, 'invalid');
  const next: Record<string, any> = { ...(existing || {}) };

  if (change.role !== undefined) {
    if (change.role === null) delete next.role; else next.role = change.role;
  }
  const merge = (field: 'apps' | 'tenants', patch: Record<string, string | null> | undefined) => {
    if (!patch) return;
    const map: Record<string, string> = { ...(next[field] || {}) };
    for (const [k, v] of Object.entries(patch)) {
      if (v === null) delete map[k]; else map[k] = v;
    }
    if (Object.keys(map).length) next[field] = map; else delete next[field];
  };
  merge('apps', change.apps);
  merge('tenants', change.tenants);

  const size = claimsBytes(next);
  if (size > CLAIMS_MAX_BYTES) {
    throw new AccessError('Access would use ' + size + ' of the ' + CLAIMS_MAX_BYTES + ' bytes Firebase allows for custom claims.', 'too-large');
  }
  return next;
}

