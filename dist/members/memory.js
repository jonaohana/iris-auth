"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMemoryMembershipStore = createMemoryMembershipStore;
exports.createMemoryIdentity = createMemoryIdentity;
function createMemoryMembershipStore(seed = []) {
    const rows = new Map();
    const key = (scope, uid) => scope + '\u0000' + uid;
    for (const m of seed)
        rows.set(key(m.scope, m.uid), { ...m });
    return {
        all: () => [...rows.values()].map((m) => ({ ...m })),
        get: async (scope, uid) => { const m = rows.get(key(scope, uid)); return m ? { ...m } : null; },
        list: async (scope) => [...rows.values()].filter((m) => m.scope === scope).map((m) => ({ ...m })),
        listForUser: async (uid) => [...rows.values()].filter((m) => m.uid === uid).map((m) => ({ ...m })),
        save: async (m) => { rows.set(key(m.scope, m.uid), { ...m }); },
        remove: async (scope, uid) => { rows.delete(key(scope, uid)); },
    };
}
function createMemoryIdentity(existing = {}, unverified = []) {
    const accounts = { ...existing }; // email -> uid
    const revoked = [];
    return {
        accounts,
        revoked,
        findOrCreate: async (email) => {
            if (accounts[email])
                return { uid: accounts[email], created: false, verified: !unverified.includes(email) };
            accounts[email] = 'uid-' + email.split('@')[0];
            return { uid: accounts[email], created: true, verified: false };
        },
        inviteLink: async (email) => 'https://example.test/set-password?e=' + encodeURIComponent(email),
        revokeSessions: async (uid) => { revoked.push(uid); },
    };
}
