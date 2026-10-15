// The member service: invite, change, remove and list the people of one scope, with the grant rules enforced here
// (never in the client). Pure orchestration over three ports: MembershipStore, MemberIdentity, and the caller's claims.
//
// Rules:
//  - Super admins and the app's admins may manage any member of any scope of the app.
//  - Anyone else needs members.manage in THAT scope, may only touch members strictly below their own level,
//    may only assign roles strictly below their own level, and may only hand out permissions they hold themselves.
//  - Nobody changes their own membership (no self-promotion); an admin does it for them.
import { AccessClaims, hasAppRole, ID_RE } from '../access';
import {
  assertRole, can, levelOf, validPermission,
} from './catalog';
import {
  MEMBERS_MANAGE, MEMBERS_VIEW, Member, MemberError, MemberIdentity, MembershipStore, RoleCatalog,
} from './types';

export interface Caller { uid: string; claims: AccessClaims }

export interface InviteInput { email: string; name?: string; role: string; title?: string; permissions?: string[] }
export interface ChangeInput { role?: string; title?: string | null; permissions?: string[]; active?: boolean }
export interface InviteResult { member: Member; /** Present only for a brand-new account: email it to them. */ inviteLink: string | null }

export interface MemberServiceOptions {
  catalog: RoleCatalog;
  store: MembershipStore;
  identity: MemberIdentity;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Standing { admin: boolean; level: number; member: Member | null }

export function makeMemberService({ catalog, store, identity }: MemberServiceOptions) {
  const standing = async (caller: Caller | null | undefined, scope: string): Promise<Standing> => {
    if (!caller || !caller.uid) throw new MemberError('Sign in required.', 'unauthenticated');
    if (!ID_RE.test(scope)) throw new MemberError('Invalid scope.', 'invalid');
    if (hasAppRole(caller.claims, catalog.app, 'admin')) return { admin: true, level: Infinity, member: null };
    const member = await store.get(scope, caller.uid);
    return { admin: false, level: levelOf(catalog, member), member };
  };

  const need = (s: Standing, permission: string) => {
    if (s.admin || can(catalog, s.member, permission)) return;
    throw new MemberError('You are not allowed to do that here.', 'forbidden');
  };

  /** The caller must outrank the role being assigned and hold every permission they pass on. */
  const checkGrant = (s: Standing, role: string | undefined, permissions: string[] | undefined) => {
    if (role !== undefined && assertRole(catalog, role).level >= s.level) {
      throw new MemberError('You can only assign roles below your own.', 'forbidden');
    }
    for (const p of permissions ?? []) {
      if (!validPermission(p)) throw new MemberError('Invalid permission: ' + p, 'invalid');
      if (!s.admin && !can(catalog, s.member, p)) throw new MemberError('You cannot grant a permission you do not have: ' + p, 'forbidden');
    }
  };

  const loadTarget = async (s: Standing, caller: Caller, scope: string, uid: string): Promise<Member> => {
    if (uid === caller.uid && !s.admin) throw new MemberError('You cannot change your own access.', 'forbidden');
    const target = await store.get(scope, uid);
    if (!target) throw new MemberError('No such member.', 'not-found');
    if (!s.admin && levelOf(catalog, target) >= s.level) {
      throw new MemberError('You can only manage members below your own level.', 'forbidden');
    }
    return target;
  };

  const text = (v: unknown, max: number, what: string): string | undefined => {
    if (v === undefined || v === null || v === '') return undefined;
    if (typeof v !== 'string' || v.length > max) throw new MemberError(what + ' is invalid.', 'invalid');
    return v.trim();
  };

  return {
    /** Add someone to the scope, creating their sign-in if they have none. */
    async invite(caller: Caller, scope: string, input: InviteInput): Promise<InviteResult> {
      const s = await standing(caller, scope);
      need(s, MEMBERS_MANAGE);
      const email = String(input?.email ?? '').trim().toLowerCase();
      if (!EMAIL_RE.test(email) || email.length > 254) throw new MemberError('A valid email is required.', 'invalid');
      const name = text(input.name, 100, 'Name');
      const title = text(input.title, 60, 'Title');
      checkGrant(s, input.role ?? '', input.permissions);

      const { uid, created } = await identity.findOrCreate(email, name);
      if (await store.get(scope, uid)) throw new MemberError('That person is already on this team.', 'conflict');
      const member: Member = { uid, email, name, scope, role: input.role, title, permissions: input.permissions?.length ? input.permissions : undefined, active: true };
      await store.save(member);
      return { member, inviteLink: created ? await identity.inviteLink(email) : null };
    },

    /** Change role, title, extra permissions, or switch the person off/on. */
    async change(caller: Caller, scope: string, uid: string, input: ChangeInput): Promise<Member> {
      const s = await standing(caller, scope);
      need(s, MEMBERS_MANAGE);
      const target = await loadTarget(s, caller, scope, uid);
      checkGrant(s, input.role, input.permissions);

      const next: Member = { ...target };
      if (input.role !== undefined) next.role = input.role;
      if (input.title !== undefined) next.title = text(input.title, 60, 'Title');
      if (input.permissions !== undefined) next.permissions = input.permissions.length ? input.permissions : undefined;
      if (input.active !== undefined) next.active = !!input.active;
      await store.save(next);

      const lowered = assertRole(catalog, next.role).level < assertRole(catalog, target.role).level;
      if ((target.active && !next.active) || lowered) await identity.revokeSessions(uid);
      return next;
    },

    /** Take someone off the scope. Their sign-in itself is untouched (they may be a customer too). */
    async remove(caller: Caller, scope: string, uid: string): Promise<void> {
      const s = await standing(caller, scope);
      need(s, MEMBERS_MANAGE);
      await loadTarget(s, caller, scope, uid);
      await store.remove(scope, uid);
      await identity.revokeSessions(uid);
    },

    async list(caller: Caller, scope: string): Promise<Member[]> {
      const s = await standing(caller, scope);
      if (!s.admin && !can(catalog, s.member, MEMBERS_VIEW) && !can(catalog, s.member, MEMBERS_MANAGE)) {
        throw new MemberError('You are not allowed to do that here.', 'forbidden');
      }
      return store.list(scope);
    },

    /** The scopes the signed-in user works in, for the app's "which store?" picker. */
    async mine(uid: string): Promise<Member[]> {
      return (await store.listForUser(uid)).filter((m) => m.active);
    },
  };
}

export type MemberService = ReturnType<typeof makeMemberService>;
