"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeMemberService = makeMemberService;
// The member service: invite, change, remove and list the people of one scope, with the grant rules enforced here
// (never in the client). Pure orchestration over three ports: MembershipStore, MemberIdentity, and the caller's claims.
//
// Rules:
//  - Super admins and the app's admins may manage any member of any scope of the app.
//  - Anyone else needs members.manage in THAT scope, may only touch members strictly below their own level,
//    may only assign roles strictly below their own level, and may only hand out permissions they hold themselves.
//  - Nobody changes their own membership (no self-promotion); an admin does it for them.
const access_1 = require("../access");
const catalog_1 = require("./catalog");
const types_1 = require("./types");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function makeMemberService({ catalog, store, identity }) {
    const standing = async (caller, scope) => {
        if (!caller || !caller.uid)
            throw new types_1.MemberError('Sign in required.', 'unauthenticated');
        if (!access_1.ID_RE.test(scope))
            throw new types_1.MemberError('Invalid scope.', 'invalid');
        if ((0, access_1.hasAppRole)(caller.claims, catalog.app, 'admin'))
            return { admin: true, level: Infinity, member: null };
        const member = await store.get(scope, caller.uid);
        return { admin: false, level: (0, catalog_1.levelOf)(catalog, member), member };
    };
    const need = (s, permission) => {
        if (s.admin || (0, catalog_1.can)(catalog, s.member, permission))
            return;
        throw new types_1.MemberError('You are not allowed to do that here.', 'forbidden');
    };
    /** The caller must outrank the role being assigned and hold every permission they pass on. */
    const checkGrant = (s, role, permissions) => {
        if (role !== undefined && (0, catalog_1.assertRole)(catalog, role).level >= s.level) {
            throw new types_1.MemberError('You can only assign roles below your own.', 'forbidden');
        }
        for (const p of permissions ?? []) {
            if (!(0, catalog_1.validPermission)(p))
                throw new types_1.MemberError('Invalid permission: ' + p, 'invalid');
            if (!s.admin && !(0, catalog_1.can)(catalog, s.member, p))
                throw new types_1.MemberError('You cannot grant a permission you do not have: ' + p, 'forbidden');
        }
    };
    const loadTarget = async (s, caller, scope, uid) => {
        if (uid === caller.uid && !s.admin)
            throw new types_1.MemberError('You cannot change your own access.', 'forbidden');
        const target = await store.get(scope, uid);
        if (!target)
            throw new types_1.MemberError('No such member.', 'not-found');
        if (!s.admin && (0, catalog_1.levelOf)(catalog, target) >= s.level) {
            throw new types_1.MemberError('You can only manage members below your own level.', 'forbidden');
        }
        return target;
    };
    const text = (v, max, what) => {
        if (v === undefined || v === null || v === '')
            return undefined;
        if (typeof v !== 'string' || v.length > max)
            throw new types_1.MemberError(what + ' is invalid.', 'invalid');
        return v.trim();
    };
    return {
        /** Add someone to the scope, creating their sign-in if they have none. */
        async invite(caller, scope, input) {
            const s = await standing(caller, scope);
            need(s, types_1.MEMBERS_MANAGE);
            const email = String(input?.email ?? '').trim().toLowerCase();
            if (!EMAIL_RE.test(email) || email.length > 254)
                throw new types_1.MemberError('A valid email is required.', 'invalid');
            const name = text(input.name, 100, 'Name');
            const title = text(input.title, 60, 'Title');
            checkGrant(s, input.role ?? '', input.permissions);
            const { uid, created } = await identity.findOrCreate(email, name);
            if (await store.get(scope, uid))
                throw new types_1.MemberError('That person is already on this team.', 'conflict');
            const member = { uid, email, name, scope, role: input.role, title, permissions: input.permissions?.length ? input.permissions : undefined, active: true };
            await store.save(member);
            return { member, inviteLink: created ? await identity.inviteLink(email) : null };
        },
        /** Change role, title, extra permissions, or switch the person off/on. */
        async change(caller, scope, uid, input) {
            const s = await standing(caller, scope);
            need(s, types_1.MEMBERS_MANAGE);
            const target = await loadTarget(s, caller, scope, uid);
            checkGrant(s, input.role, input.permissions);
            const next = { ...target };
            if (input.role !== undefined)
                next.role = input.role;
            if (input.title !== undefined)
                next.title = text(input.title, 60, 'Title');
            if (input.permissions !== undefined)
                next.permissions = input.permissions.length ? input.permissions : undefined;
            if (input.active !== undefined)
                next.active = !!input.active;
            await store.save(next);
            const lowered = (0, catalog_1.assertRole)(catalog, next.role).level < (0, catalog_1.assertRole)(catalog, target.role).level;
            if ((target.active && !next.active) || lowered)
                await identity.revokeSessions(uid);
            return next;
        },
        /** Take someone off the scope. Their sign-in itself is untouched (they may be a customer too). */
        async remove(caller, scope, uid) {
            const s = await standing(caller, scope);
            need(s, types_1.MEMBERS_MANAGE);
            await loadTarget(s, caller, scope, uid);
            await store.remove(scope, uid);
            await identity.revokeSessions(uid);
        },
        async list(caller, scope) {
            const s = await standing(caller, scope);
            if (!s.admin && !(0, catalog_1.can)(catalog, s.member, types_1.MEMBERS_VIEW) && !(0, catalog_1.can)(catalog, s.member, types_1.MEMBERS_MANAGE)) {
                throw new types_1.MemberError('You are not allowed to do that here.', 'forbidden');
            }
            return store.list(scope);
        },
        /** The scopes the signed-in user works in, for the app's "which store?" picker. */
        async mine(uid) {
            return (await store.listForUser(uid)).filter((m) => m.active);
        },
    };
}
