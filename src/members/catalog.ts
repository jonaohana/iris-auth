// Pure checks over a role catalog. No I/O.
import { Member, MemberError, RoleCatalog, RoleDef } from './types';

const PERMISSION_RE = /^(\*|[a-z][a-z0-9_-]*(\.([a-z][a-z0-9_-]*|\*))*)$/;
const ROLE_NAME_RE = /^[a-z][a-z0-9_-]{0,31}$/;

/** Throws on a malformed catalog so a typo fails at startup, not when someone is locked out. */
export function defineCatalog(catalog: RoleCatalog): RoleCatalog {
  if (!/^[a-z][a-z0-9_-]{0,31}$/.test(catalog.app)) throw new Error('Catalog app name is invalid: ' + catalog.app);
  const names = Object.keys(catalog.roles);
  if (!names.length) throw new Error('Catalog needs at least one role.');
  for (const name of names) {
    const r = catalog.roles[name];
    if (!ROLE_NAME_RE.test(name)) throw new Error('Invalid role name: ' + name);
    if (!r.title || !Number.isFinite(r.level)) throw new Error('Role ' + name + ' needs a title and a numeric level.');
    for (const p of r.permissions) if (!PERMISSION_RE.test(p)) throw new Error('Invalid permission "' + p + '" on ' + name);
  }
  return catalog;
}

export const roleOf = (catalog: RoleCatalog, role: string): RoleDef | null => catalog.roles[role] ?? null;

/** Does a granted permission cover the wanted one? '*' covers all; 'orders.*' covers 'orders.view'. */
export function covers(granted: string, wanted: string): boolean {
  if (granted === '*' || granted === wanted) return true;
  return granted.endsWith('.*') && wanted.startsWith(granted.slice(0, -1));
}

/** Everything the member may do: their role's permissions plus personal extras. Inactive members can do nothing. */
export function permissionsOf(catalog: RoleCatalog, member: Member | null | undefined): string[] {
  if (!member || !member.active) return [];
  const def = roleOf(catalog, member.role);
  if (!def) return [];
  return [...def.permissions, ...(member.permissions ?? [])];
}

export function can(catalog: RoleCatalog, member: Member | null | undefined, permission: string): boolean {
  return permissionsOf(catalog, member).some((g) => covers(g, permission));
}

export const levelOf = (catalog: RoleCatalog, member: Member | null | undefined): number =>
  member && member.active ? roleOf(catalog, member.role)?.level ?? -1 : -1;

export function assertRole(catalog: RoleCatalog, role: string): RoleDef {
  const def = roleOf(catalog, role);
  if (!def) throw new MemberError('Unknown role: ' + role, 'invalid');
  return def;
}

export function validPermission(p: unknown): p is string {
  return typeof p === 'string' && p.length <= 64 && PERMISSION_RE.test(p);
}
