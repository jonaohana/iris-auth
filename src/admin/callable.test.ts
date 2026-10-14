import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RoleAdmin } from './roleAdmin';
import { makeChangeAccessCallable, makeSetRoleCallable, RoleAuthError } from './functions';

// An in-memory stand-in for the Firebase Admin Auth API.
function fakeFirebase(users: Record<string, { email: string; claims: Record<string, any> }>) {
  const revoked: string[] = [];
  const auth: any = {
    getUser: async (uid: string) => { const u = users[uid]; if (!u) throw new Error('no user ' + uid); return { uid, email: u.email, customClaims: u.claims }; },
    getUserByEmail: async (email: string) => {
      const hit = Object.entries(users).find(([, u]) => u.email === email);
      if (!hit) throw new Error('no user ' + email);
      return { uid: hit[0], email, customClaims: hit[1].claims };
    },
    setCustomUserClaims: async (uid: string, claims: Record<string, any>) => { users[uid].claims = claims; },
    revokeRefreshTokens: async (uid: string) => { revoked.push(uid); },
  };
  const roleAdmin = new RoleAdmin(undefined, auth);
  return { users, revoked, call: makeChangeAccessCallable({ roleAdmin }), setRole: makeSetRoleCallable({ roleAdmin }) };
}

const STORE = 'ganjahub/store1';
const world = () => fakeFirebase({
  root: { email: 'root@x.com', claims: { role: 'superadmin' } },
  ga: { email: 'ga@x.com', claims: { role: 'user', apps: { ganjahub: 'admin' } } },
  own: { email: 'own@x.com', claims: { tenants: { [STORE]: 'owner' } } },
  cus: { email: 'cus@x.com', claims: { betaTester: true } },
  ex: { email: 'ex@x.com', claims: {} },
});
const as = (uid: string, token: Record<string, any> = {}) => ({ uid, token });
const code = (e: any) => e instanceof RoleAuthError && e.code;

test('callable: must be signed in and name a target', async () => {
  const w = world();
  await assert.rejects(w.call({ uid: 'cus', role: 'admin' }, undefined), (e: any) => code(e) === 'unauthenticated');
  await assert.rejects(w.call({ role: 'admin' }, as('root')), (e: any) => code(e) === 'invalid-argument');
});

test('callable: a customer cannot grant anything', async () => {
  const w = world();
  await assert.rejects(w.call({ uid: 'ex', tenants: { [STORE]: 'staff' } }, as('cus')), (e: any) => code(e) === 'permission-denied');
  await assert.rejects(w.call({ uid: 'cus', role: 'superadmin' }, as('cus')), (e: any) => code(e) === 'permission-denied');
  assert.deepEqual(w.users.cus.claims, { betaTester: true }); // untouched
});

test('callable: super admin creates an app admin, by email, keeping unrelated claims', async () => {
  const w = world();
  const out = await w.call({ email: 'cus@x.com', apps: { ganjahub: 'admin' } }, as('root'));
  assert.deepEqual(out.apps, { ganjahub: 'admin' });
  assert.equal(out.sessionsRevoked, false);
  assert.deepEqual(w.users.cus.claims, { betaTester: true, apps: { ganjahub: 'admin' } });
});

test('callable: a store owner adds staff to their own store only', async () => {
  const w = world();
  await w.call({ uid: 'ex', tenants: { [STORE]: 'staff' } }, as('own'));
  assert.deepEqual(w.users.ex.claims, { tenants: { [STORE]: 'staff' } });
  await assert.rejects(w.call({ uid: 'ex', tenants: { 'ganjahub/store2': 'staff' } }, as('own')), (e: any) => code(e) === 'permission-denied');
  await assert.rejects(w.call({ uid: 'ex', tenants: { [STORE]: 'owner' } }, as('own')), (e: any) => code(e) === 'permission-denied');
});

test('callable: removing access revokes the user\'s sessions', async () => {
  const w = world();
  const out = await w.call({ uid: 'ga', apps: { ganjahub: null } }, as('root'));
  assert.equal(out.sessionsRevoked, true);
  assert.deepEqual(w.revoked, ['ga']);
  assert.equal('apps' in w.users.ga.claims, false);
});

test('callable: a demoted admin with a still-valid token cannot keep granting (caller is checked live)', async () => {
  const w = world();
  w.users.ga.claims = { role: 'user' }; // Firebase says the admin role is gone…
  const staleToken = { role: 'user', apps: { ganjahub: 'admin' } }; // …but their old ID token still says admin
  await assert.rejects(w.call({ uid: 'ex', tenants: { [STORE]: 'staff' } }, as('ga', staleToken)), (e: any) => code(e) === 'permission-denied');
  assert.deepEqual(w.users.ex.claims, {});
});

test('callable: invalid input and over-size claims come back as invalid-argument', async () => {
  const w = world();
  await assert.rejects(w.call({ uid: 'ex', apps: { Bad: 'admin' } as any }, as('root')), (e: any) => code(e) === 'invalid-argument');
  const many: Record<string, any> = {};
  for (let i = 0; i < 40; i++) many['ganjahub/store' + String(i).padStart(20, '0')] = 'staff';
  await assert.rejects(w.call({ uid: 'ex', tenants: many }, as('root')), (e: any) => code(e) === 'invalid-argument');
  assert.deepEqual(w.users.ex.claims, {});
});

test('callable: a super admin cannot remove their own super admin role', async () => {
  const w = world();
  await assert.rejects(w.call({ uid: 'root', role: null }, as('root')), (e: any) => code(e) === 'permission-denied');
  assert.deepEqual(w.users.root.claims, { role: 'superadmin' });
});

test('legacy setRole: only a super admin may use it, so an admin cannot mint super admins', async () => {
  const w = world();
  await assert.rejects(w.setRole({ uid: 'cus', role: 'superadmin' }, as('ga', { role: 'admin' })), (e: any) => code(e) === 'permission-denied');
  await assert.rejects(w.setRole({ uid: 'cus', role: 'superadmin' }, as('ga', { role: 'user', apps: { ganjahub: 'admin' } })), (e: any) => code(e) === 'permission-denied');
  assert.equal(w.users.cus.claims.role, undefined);
  await w.setRole({ uid: 'cus', role: 'admin' }, as('root', { role: 'superadmin' }));
  assert.equal(w.users.cus.claims.role, 'admin');
});
