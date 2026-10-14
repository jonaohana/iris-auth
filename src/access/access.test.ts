import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseClaims, claimsBytes, isSuperAdmin, hasAppRole, hasTenantRole, tenantsOf, tenantKey, splitTenantKey,
  authorizeChange, applyChange, validateChange, makeGuards, AccessClaims, AccessError, CLAIMS_MAX_BYTES,
} from './index';

const claims = (raw: Record<string, any>): AccessClaims => parseClaims(raw);
const actor = (uid: string, raw: Record<string, any>) => ({ uid, claims: claims(raw) });
const STORE = 'ganjahub/store1';
const OTHER = 'ganjahub/store2';

const superAdmin = actor('root', { role: 'superadmin' });
const ganjaAdmin = actor('ga', { role: 'user', apps: { ganjahub: 'admin' } });
const sparta = actor('sa', { role: 'user', apps: { forsparta: 'admin' } });
const owner = actor('own', { tenants: { [STORE]: 'owner' } });
const manager = actor('mgr', { tenants: { [STORE]: 'manager' } });
const customer = actor('cus', {});

test('parseClaims keeps valid claims and drops junk', () => {
  const c = claims({
    role: 'superadmin', apps: { ganjahub: 'admin', 'Bad Name': 'admin', forsparta: 'god' },
    tenants: { [STORE]: 'owner', nosep: 'owner', [OTHER]: 'wizard' }, permissions: ['a', 7, 'b'],
  });
  assert.equal(c.role, 'superadmin');
  assert.deepEqual(c.apps, { ganjahub: 'admin' });
  assert.deepEqual(c.tenants, { [STORE]: 'owner' });
  assert.deepEqual(c.permissions, ['a', 'b']);
  assert.deepEqual(parseClaims(null), { role: null, apps: {}, tenants: {}, permissions: [] });
});

test('tenant keys round-trip and reject malformed ones', () => {
  assert.equal(tenantKey('ganjahub', 'abc'), 'ganjahub/abc');
  assert.deepEqual(splitTenantKey('ganjahub/abc'), { app: 'ganjahub', id: 'abc' });
  for (const bad of ['', '/abc', 'ganjahub/', 'Gan/abc', 'ganjahub/a b']) assert.equal(splitTenantKey(bad), null, bad);
});

test('claimsBytes counts UTF-8 like Firebase', () => {
  assert.equal(claimsBytes({}), 2);
  assert.equal(claimsBytes({ a: 'é' }), JSON.stringify({ a: 'é' }).length + 1);
  assert.equal(claimsBytes({ a: '😀' }), JSON.stringify({ a: '😀' }).length + 2);
});

test('super admin passes every check; customers pass none', () => {
  assert.equal(isSuperAdmin(superAdmin.claims), true);
  assert.equal(hasAppRole(superAdmin.claims, 'anything'), true);
  assert.equal(hasTenantRole(superAdmin.claims, 'ganjahub', 'whatever', 'owner'), true);
  assert.equal(isSuperAdmin(customer.claims), false);
  assert.equal(hasAppRole(customer.claims, 'ganjahub'), false);
  assert.equal(hasTenantRole(customer.claims, 'ganjahub', 'store1'), false);
  assert.equal(hasAppRole(null, 'ganjahub'), false);
});

test('app admins are scoped to their own app', () => {
  assert.equal(hasAppRole(ganjaAdmin.claims, 'ganjahub'), true);
  assert.equal(hasAppRole(ganjaAdmin.claims, 'forsparta'), false);
  assert.equal(hasAppRole(actor('s', { apps: { ganjahub: 'staff' } }).claims, 'ganjahub', 'admin'), false);
  assert.equal(hasAppRole(actor('s', { apps: { ganjahub: 'staff' } }).claims, 'ganjahub', 'staff'), true);
  assert.equal(hasAppRole(actor('legacy', { role: 'admin' }).claims, 'forsparta'), true); // old global admin claims still work
});

test('tenant roles are ranked and never cross stores or imply app admin', () => {
  assert.equal(hasTenantRole(owner.claims, 'ganjahub', 'store1', 'manager'), true);
  assert.equal(hasTenantRole(manager.claims, 'ganjahub', 'store1', 'manager'), true);
  assert.equal(hasTenantRole(manager.claims, 'ganjahub', 'store1', 'owner'), false);
  assert.equal(hasTenantRole(owner.claims, 'ganjahub', 'store2'), false);
  assert.equal(hasTenantRole(owner.claims, 'forsparta', 'store1'), false);
  assert.equal(hasAppRole(owner.claims, 'ganjahub'), false);
  assert.equal(hasTenantRole(ganjaAdmin.claims, 'ganjahub', 'store1'), false); // an app admin is not automatically inside a store
  assert.deepEqual(tenantsOf(owner.claims, 'ganjahub'), [{ id: 'store1', role: 'owner' }]);
  assert.deepEqual(tenantsOf(owner.claims, 'forsparta'), []);
});

test('only a super admin can change platform roles and app roles', () => {
  const grantAdmin = { apps: { ganjahub: 'admin' as const } };
  assert.equal(authorizeChange(superAdmin, customer, { role: 'admin' }).ok, true);
  assert.equal(authorizeChange(superAdmin, customer, grantAdmin).ok, true);
  for (const who of [ganjaAdmin, owner, manager, customer]) {
    assert.equal(authorizeChange(who, customer, { role: 'admin' }).ok, false, who.uid + ' role');
    assert.equal(authorizeChange(who, customer, grantAdmin).ok, false, who.uid + ' apps');
  }
});

test('nobody can promote themselves, and a super admin cannot lock themselves out', () => {
  assert.equal(authorizeChange(customer, customer, { role: 'superadmin' }).ok, false);
  assert.equal(authorizeChange(ganjaAdmin, ganjaAdmin, { apps: { forsparta: 'admin' } }).ok, false);
  assert.equal(authorizeChange(superAdmin, superAdmin, { role: null }).ok, false);
  assert.equal(authorizeChange(superAdmin, superAdmin, { tenants: { [STORE]: 'owner' } }).ok, true); // other changes to self are fine
});

test('only a super admin may touch a super admin', () => {
  assert.equal(authorizeChange(ganjaAdmin, superAdmin, { tenants: { [STORE]: 'staff' } }).ok, false);
  assert.equal(authorizeChange(owner, superAdmin, { tenants: { [STORE]: 'staff' } }).ok, false);
  assert.equal(authorizeChange(actor('root2', { role: 'superadmin' }), superAdmin, { tenants: { [STORE]: 'staff' } }).ok, true);
});

test('store roles: app admin and owner may grant; scope and ceiling are enforced', () => {
  const addStaff = { tenants: { [STORE]: 'staff' as const } };
  assert.equal(authorizeChange(ganjaAdmin, customer, addStaff).ok, true);
  assert.equal(authorizeChange(ganjaAdmin, customer, { tenants: { [STORE]: 'owner' } }).ok, true); // onboarding a store owner
  assert.equal(authorizeChange(sparta, customer, addStaff).ok, false); // another app's admin
  assert.equal(authorizeChange(owner, customer, addStaff).ok, true);
  assert.equal(authorizeChange(owner, customer, { tenants: { [STORE]: 'manager' } }).ok, true);
  assert.equal(authorizeChange(owner, customer, { tenants: { [STORE]: null } }).ok, true);
  assert.equal(authorizeChange(owner, customer, { tenants: { [STORE]: 'owner' } }).ok, false); // owners cannot mint owners
  assert.equal(authorizeChange(owner, customer, { tenants: { [OTHER]: 'staff' } }).ok, false); // not their store
  assert.equal(authorizeChange(owner, actor('o2', { tenants: { [STORE]: 'owner' } }), { tenants: { [STORE]: null } }).ok, false);
  assert.equal(authorizeChange(manager, customer, addStaff).ok, false); // managers cannot grant
  assert.equal(authorizeChange(customer, customer, addStaff).ok, false);
  // one disallowed entry fails the whole change
  assert.equal(authorizeChange(owner, customer, { tenants: { [STORE]: 'staff', [OTHER]: 'staff' } }).ok, false);
});

test('validateChange rejects malformed input', () => {
  for (const bad of [
    null, {}, { role: 'Bad Role' }, { apps: { Bad: 'admin' } }, { apps: { ganjahub: 'god' } },
    { tenants: { nosep: 'owner' } }, { tenants: { [STORE]: 'wizard' } },
  ] as any[]) assert.notEqual(validateChange(bad), null, JSON.stringify(bad));
  assert.equal(validateChange({ role: null }), null);
  assert.equal(validateChange({ tenants: { [STORE]: null } }), null);
});

test('applyChange merges, removes, and keeps unrelated claims', () => {
  const start = { role: 'user', permissions: ['x'], betaTester: true, tenants: { [STORE]: 'staff' } };
  const next = applyChange(start, { role: 'admin', apps: { ganjahub: 'admin' }, tenants: { [OTHER]: 'manager' } });
  assert.deepEqual(next, { role: 'admin', permissions: ['x'], betaTester: true, apps: { ganjahub: 'admin' }, tenants: { [STORE]: 'staff', [OTHER]: 'manager' } });
  assert.deepEqual(start.tenants, { [STORE]: 'staff' }); // input untouched

  const cleared = applyChange(next, { role: null, apps: { ganjahub: null }, tenants: { [STORE]: null, [OTHER]: null } });
  assert.deepEqual(cleared, { permissions: ['x'], betaTester: true }); // empty maps and role are removed entirely
  assert.deepEqual(applyChange(undefined, { role: 'superadmin' }), { role: 'superadmin' });
});

test('applyChange refuses to exceed the 1000-byte Firebase limit', () => {
  const tenants: Record<string, 'staff'> = {};
  for (let i = 0; i < 40; i++) tenants['ganjahub/store' + String(i).padStart(20, '0')] = 'staff';
  assert.throws(() => applyChange({}, { tenants }), (e: any) => e instanceof AccessError && e.code === 'too-large');
  const ok: Record<string, 'staff'> = {};
  for (let i = 0; i < 10; i++) ok['ganjahub/store' + String(i).padStart(20, '0')] = 'staff';
  assert.ok(claimsBytes(applyChange({}, { tenants: ok })) <= CLAIMS_MAX_BYTES);
  assert.throws(() => applyChange({}, { role: 'Bad Role' }), (e: any) => e instanceof AccessError && e.code === 'invalid');
});

test('guards answer 401 / 403 / pass', () => {
  const calls: Array<[number, any]> = [];
  const res = { status: (c: number) => ({ json: (b: any) => { calls.push([c, b]); } }) };
  const g = makeGuards((req: any) => req.claims);
  const run = (mw: any, req: any) => { let passed = false; mw(req, res, () => { passed = true; }); return passed; };

  assert.equal(run(g.requireSuperAdmin, { claims: null }), false);
  assert.equal(calls.pop()![0], 401);
  assert.equal(run(g.requireSuperAdmin, { claims: ganjaAdmin.claims }), false);
  assert.equal(calls.pop()![0], 403);
  assert.equal(run(g.requireSuperAdmin, { claims: superAdmin.claims }), true);

  assert.equal(run(g.requireApp('ganjahub'), { claims: ganjaAdmin.claims }), true);
  assert.equal(run(g.requireApp('forsparta'), { claims: ganjaAdmin.claims }), false);

  const store = g.requireTenant('ganjahub', (r: any) => r.params?.storeId, 'manager');
  assert.equal(run(store, { claims: manager.claims, params: { storeId: 'store1' } }), true);
  assert.equal(run(store, { claims: manager.claims, params: { storeId: 'store2' } }), false);
  assert.equal(run(store, { claims: manager.claims, params: {} }), false); // no id in the request: deny
  assert.equal(run(store, { claims: ganjaAdmin.claims, params: { storeId: 'store1' } }), false);

  const either = g.requireTenantOrAppAdmin('ganjahub', (r: any) => r.params?.storeId);
  assert.equal(run(either, { claims: ganjaAdmin.claims, params: { storeId: 'store1' } }), true);
  assert.equal(run(either, { claims: owner.claims, params: { storeId: 'store1' } }), true);
  assert.equal(run(either, { claims: owner.claims, params: { storeId: 'store2' } }), false);
});

test('reducesAccess flags every way of losing access, and only those', async () => {
  const { reducesAccess } = await import('./index');
  const was = claims({ role: 'admin', apps: { ganjahub: 'admin', forsparta: 'staff' }, tenants: { [STORE]: 'owner' } });
  assert.equal(reducesAccess(was, was), false);
  assert.equal(reducesAccess(was, claims({ role: 'admin', apps: { ganjahub: 'admin', forsparta: 'admin' }, tenants: { [STORE]: 'owner', [OTHER]: 'staff' } })), false); // only gained
  assert.equal(reducesAccess(was, claims({ role: 'user', apps: { ganjahub: 'admin', forsparta: 'staff' }, tenants: { [STORE]: 'owner' } })), true); // role dropped
  assert.equal(reducesAccess(was, claims({ role: 'admin', apps: { forsparta: 'staff' }, tenants: { [STORE]: 'owner' } })), true); // app removed
  assert.equal(reducesAccess(was, claims({ role: 'admin', apps: { ganjahub: 'staff', forsparta: 'staff' }, tenants: { [STORE]: 'owner' } })), true); // app lowered
  assert.equal(reducesAccess(was, claims({ role: 'admin', apps: { ganjahub: 'admin', forsparta: 'staff' }, tenants: { [STORE]: 'manager' } })), true); // store lowered
  assert.equal(reducesAccess(was, claims({ role: 'admin', apps: { ganjahub: 'admin', forsparta: 'staff' }, tenants: {} })), true); // store removed
  assert.equal(reducesAccess(claims({ role: 'superadmin' }), claims({ role: 'admin' })), true);
});
