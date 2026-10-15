import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseClaims } from '../access';
import {
  Caller, MemberError, createMemoryIdentity, createMemoryMembershipStore, defineCatalog, makeMemberGuards, makeMemberService,
} from './index';
import { makeFirebaseMemberIdentity } from '../admin/memberIdentity';

const catalog = defineCatalog({
  app: 'ganjahub',
  roles: {
    owner: { title: 'Owner', level: 30, permissions: ['*'] },
    manager: { title: 'Manager', level: 20, permissions: ['members.manage', 'members.view', 'products.*', 'orders.*'] },
    staff: { title: 'Staff', level: 10, permissions: ['orders.view', 'orders.update'] },
    driver: { title: 'Driver', level: 5, permissions: ['deliveries.view'] },
  },
});

const S1 = 'store1';
const S2 = 'store2';
const member = (uid: string, role: string, scope = S1, extra: any = {}) => ({ uid, email: uid + '@x.com', scope, role, active: true, ...extra });

function world() {
  const store = createMemoryMembershipStore([
    member('own', 'owner'), member('mgr', 'manager'), member('stf', 'staff'), member('mgr2', 'manager'), member('other', 'owner', S2),
  ]);
  const identity = createMemoryIdentity({ 'cus@x.com': 'cus' });
  return { store, identity, svc: makeMemberService({ catalog, store, identity }) };
}
const who = (uid: string, claims: any = {}): Caller => ({ uid, claims: parseClaims(claims) });
const code = (e: any) => e instanceof MemberError && e.code;

test('catalog: typos fail at startup', () => {
  assert.throws(() => defineCatalog({ app: 'Bad', roles: { a: { title: 'A', level: 1, permissions: [] } } }));
  assert.throws(() => defineCatalog({ app: 'x', roles: { a: { title: 'A', level: 1, permissions: ['Bad Perm'] } } }));
  assert.throws(() => defineCatalog({ app: 'x', roles: {} }));
});

test('a manager invites staff: new account, invite link, member saved', async () => {
  const w = world();
  const r = await w.svc.invite(who('mgr'), S1, { email: ' New@X.com ', name: 'Nia', role: 'staff', title: 'Night shift' });
  assert.equal(r.member.email, 'new@x.com');
  assert.equal(r.member.title, 'Night shift');
  assert.ok(r.inviteLink);
  assert.equal((await w.store.get(S1, r.member.uid))?.role, 'staff');
});

test('inviting someone who already has a sign-in (a customer) reuses it and sends no invite link', async () => {
  const w = world();
  const r = await w.svc.invite(who('own'), S1, { email: 'cus@x.com', role: 'driver' });
  assert.equal(r.member.uid, 'cus');
  assert.equal(r.inviteLink, null);
  await assert.rejects(w.svc.invite(who('own'), S1, { email: 'cus@x.com', role: 'driver' }), (e: any) => code(e) === 'conflict');
});

test('managers can only create roles below their own; owners are made by owners-above or admins', async () => {
  const w = world();
  await assert.rejects(w.svc.invite(who('mgr'), S1, { email: 'a@x.com', role: 'manager' }), (e: any) => code(e) === 'forbidden');
  await assert.rejects(w.svc.invite(who('mgr'), S1, { email: 'a@x.com', role: 'owner' }), (e: any) => code(e) === 'forbidden');
  await assert.rejects(w.svc.invite(who('own'), S1, { email: 'a@x.com', role: 'owner' }), (e: any) => code(e) === 'forbidden');
  const byOwner = await w.svc.invite(who('own'), S1, { email: 'm@x.com', role: 'manager' });
  assert.equal(byOwner.member.role, 'manager');
});

test('app admins and super admins make owners and managers, in any store of the app', async () => {
  const w = world();
  const a = await w.svc.invite(who('ga', { apps: { ganjahub: 'admin' } }), S2, { email: 'o@x.com', role: 'owner' });
  assert.equal(a.member.role, 'owner');
  const b = await w.svc.invite(who('root', { role: 'superadmin' }), S1, { email: 'p@x.com', role: 'manager' });
  assert.equal(b.member.role, 'manager');
  // an admin of ANOTHER app has no power here
  await assert.rejects(w.svc.invite(who('hm', { apps: { hermes: 'admin' } }), S1, { email: 'q@x.com', role: 'staff' }), (e: any) => code(e) === 'forbidden');
});

test('staff, drivers, strangers and other stores cannot manage a team', async () => {
  const w = world();
  for (const uid of ['stf', 'nobody', 'other']) {
    await assert.rejects(w.svc.invite(who(uid), S1, { email: 'z@x.com', role: 'driver' }), (e: any) => code(e) === 'forbidden', uid);
    await assert.rejects(w.svc.list(who(uid), S1), (e: any) => code(e) === 'forbidden', uid);
  }
  await assert.rejects(w.svc.invite(undefined as any, S1, { email: 'z@x.com', role: 'driver' }), (e: any) => code(e) === 'unauthenticated');
});

test('peers and superiors are untouchable; nobody edits themselves', async () => {
  const w = world();
  await assert.rejects(w.svc.change(who('mgr'), S1, 'mgr2', { active: false }), (e: any) => code(e) === 'forbidden');
  await assert.rejects(w.svc.change(who('mgr'), S1, 'own', { role: 'staff' }), (e: any) => code(e) === 'forbidden');
  await assert.rejects(w.svc.remove(who('mgr'), S1, 'own'), (e: any) => code(e) === 'forbidden');
  await assert.rejects(w.svc.change(who('mgr'), S1, 'mgr', { role: 'staff' }), (e: any) => code(e) === 'forbidden');
  await assert.rejects(w.svc.change(who('own'), S1, 'own', { role: 'staff' }), (e: any) => code(e) === 'forbidden');
  assert.equal((await w.store.get(S1, 'own'))?.role, 'owner');
});

test('a manager cannot promote staff past themselves, or hand out permissions they lack', async () => {
  const w = world();
  await assert.rejects(w.svc.change(who('mgr'), S1, 'stf', { role: 'manager' }), (e: any) => code(e) === 'forbidden');
  await assert.rejects(w.svc.change(who('mgr'), S1, 'stf', { permissions: ['payouts.view'] }), (e: any) => code(e) === 'forbidden');
  await assert.rejects(w.svc.change(who('mgr'), S1, 'stf', { permissions: ['*'] }), (e: any) => code(e) === 'forbidden');
  const ok = await w.svc.change(who('mgr'), S1, 'stf', { permissions: ['products.write'], title: 'Budtender' });
  assert.deepEqual(ok.permissions, ['products.write']);
  assert.equal(ok.title, 'Budtender');
});

test('deactivating, lowering or removing ends the person\'s sessions; a promotion does not', async () => {
  const w = world();
  await w.svc.change(who('own'), S1, 'stf', { title: 'Lead' });
  assert.deepEqual(w.identity.revoked, []);
  await w.svc.change(who('own'), S1, 'mgr', { role: 'staff' });
  assert.deepEqual(w.identity.revoked, ['mgr']);
  await w.svc.change(who('own'), S1, 'stf', { active: false });
  await w.svc.remove(who('own'), S1, 'mgr2');
  assert.deepEqual(w.identity.revoked, ['mgr', 'stf', 'mgr2']);
  assert.equal(await w.store.get(S1, 'mgr2'), null);
  assert.deepEqual((await w.svc.mine('stf')), []); // inactive memberships do not show
});

test('a removed manager loses access at once, even holding a valid token', async () => {
  const w = world();
  await w.svc.remove(who('own'), S1, 'mgr');
  await assert.rejects(w.svc.invite(who('mgr'), S1, { email: 'z@x.com', role: 'driver' }), (e: any) => code(e) === 'forbidden');
});

test('input is validated', async () => {
  const w = world();
  const bad = (i: any) => assert.rejects(w.svc.invite(who('own'), S1, i), (e: any) => code(e) === 'invalid');
  await bad({ email: 'nope', role: 'staff' });
  await bad({ email: 'a@x.com', role: 'wizard' });
  await bad({ email: 'a@x.com' });
  await bad({ email: 'a@x.com', role: 'staff', permissions: ['Not Valid'] });
  await bad({ email: 'a@x.com', role: 'staff', title: 'x'.repeat(61) });
  await assert.rejects(w.svc.list(who('own'), '../etc'), (e: any) => code(e) === 'invalid');
});

test('list: managers see their own store only', async () => {
  const w = world();
  assert.equal((await w.svc.list(who('mgr'), S1)).length, 4);
  await assert.rejects(w.svc.list(who('mgr'), S2), (e: any) => code(e) === 'forbidden');
});

// --- middleware ----------------------------------------------------------------------------------------------------

function run(guard: any, req: any) {
  return new Promise<{ status: number; body?: any; nexted: boolean }>((resolve) => {
    const res: any = { status: (s: number) => ({ json: (b: any) => resolve({ status: s, body: b, nexted: false }) }) };
    Promise.resolve(guard(req, res, () => resolve({ status: 200, nexted: true })));
  });
}

test('middleware: scope comes from the verified membership and cannot be forged', async () => {
  const w = world();
  const g = makeMemberGuards({ catalog, store: w.store, getUid: (r) => r.uid, getClaims: (r) => r.claims, scopeFrom: (r) => r.headers?.scope });
  const need = g.requirePermission('products.write');

  assert.equal((await run(need, {})).status, 401);
  const ok = { uid: 'mgr', headers: { scope: S1 } } as any;
  assert.equal((await run(need, ok)).nexted, true);
  assert.equal(ok.scope, S1);
  assert.equal(ok.member.role, 'manager');
  assert.equal((await run(need, { uid: 'mgr', headers: { scope: S2 } })).status, 403); // someone else's store
  assert.equal((await run(need, { uid: 'stf', headers: { scope: S1 } })).status, 403); // role lacks the permission
  assert.equal((await run(need, { uid: 'nobody', headers: { scope: S1 } })).status, 403);
  const admin = { uid: 'ga', claims: parseClaims({ apps: { ganjahub: 'admin' } }), headers: { scope: S2 } } as any;
  assert.equal((await run(need, admin)).nexted, true);
});

test('middleware: without a named scope, a one-store member is placed automatically', async () => {
  const w = world();
  const g = makeMemberGuards({ catalog, store: w.store, getUid: (r) => r.uid });
  const req = { uid: 'mgr' } as any;
  assert.equal((await run(g.requirePermission('orders.view'), req)).nexted, true);
  assert.equal(req.scope, S1);
  await w.store.save(member('mgr', 'manager', S2));
  assert.equal((await run(g.requirePermission('orders.view'), { uid: 'mgr' })).status, 400); // two stores: must choose
  await w.store.save({ ...member('stf', 'staff'), active: false });
  assert.equal((await run(g.requirePermission('orders.view'), { uid: 'stf' })).status, 403); // deactivated
});

// --- Firebase adapter ----------------------------------------------------------------------------------------------

test('firebase identity: finds, creates, links, revokes', async () => {
  const users: Record<string, any> = { u1: { uid: 'u1', email: 'a@x.com', disabled: false }, u2: { uid: 'u2', email: 'off@x.com', disabled: true } };
  const calls: string[] = [];
  const auth: any = {
    getUserByEmail: async (e: string) => { const u = Object.values(users).find((x: any) => x.email === e); if (!u) throw Object.assign(new Error('nf'), { code: 'auth/user-not-found' }); return u; },
    createUser: async (p: any) => { users.u3 = { uid: 'u3', ...p }; return users.u3; },
    generatePasswordResetLink: async (e: string) => 'link:' + e,
    revokeRefreshTokens: async (uid: string) => { calls.push('revoke:' + uid); },
  };
  const id = makeFirebaseMemberIdentity(undefined, auth);
  assert.deepEqual(await id.findOrCreate('a@x.com'), { uid: 'u1', created: false });
  assert.deepEqual(await id.findOrCreate('new@x.com', 'New'), { uid: 'u3', created: true });
  await assert.rejects(id.findOrCreate('off@x.com'));
  assert.equal(await id.inviteLink('new@x.com'), 'link:new@x.com');
  await id.revokeSessions('u1');
  assert.deepEqual(calls, ['revoke:u1']);
});
