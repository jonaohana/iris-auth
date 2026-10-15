"use strict";
// Members: people who hold a role inside one scope (a store, team, org...) of one app.
// Identity comes from Firebase; WHICH scope and role lives in the app's own database behind MembershipStore.
// Keeping membership in the app DB means removal is immediate, there is no claims size limit, and one person
// can belong to many scopes.
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberError = exports.MEMBERS_MANAGE = exports.MEMBERS_VIEW = void 0;
/** Permissions the member service itself checks. Put them on the roles that should manage the team. */
exports.MEMBERS_VIEW = 'members.view';
exports.MEMBERS_MANAGE = 'members.manage';
class MemberError extends Error {
    constructor(message, code = 'invalid') {
        super(message);
        this.code = code;
        this.name = 'MemberError';
    }
}
exports.MemberError = MemberError;
