// In-memory implementations for tests and local development. Not for production.
import { Member, MemberIdentity, MembershipStore } from './types';

export function createMemoryMembershipStore(seed: Member[] = []): MembershipStore & { all(): Member[] } {
  const rows = new Map<string, Member>();
  const key = (scope: string, uid: string) => scope + '\u0000' + uid;
  for (const m of seed) rows.set(key(m.scope, m.uid), { ...m });
  return {
    all: () => [...rows.values()].map((m) => ({ ...m })),
    get: async (scope, uid) => { const m = rows.get(key(scope, uid)); return m ? { ...m } : null; },
    list: async (scope) => [...rows.values()].filter((m) => m.scope === scope).map((m) => ({ ...m })),
    listForUser: async (uid) => [...rows.values()].filter((m) => m.uid === uid).map((m) => ({ ...m })),
    save: async (m) => { rows.set(key(m.scope, m.uid), { ...m }); },
    remove: async (scope, uid) => { rows.delete(key(scope, uid)); },
  };
}

export function createMemoryIdentity(existing: Record<string, string> = {}): MemberIdentity & { revoked: string[]; accounts: Record<string, string> } {
  const accounts: Record<string, string> = { ...existing }; // email -> uid
  const revoked: string[] = [];
  return {
    accounts,
    revoked,
    findOrCreate: async (email) => {
      if (accounts[email]) return { uid: accounts[email], created: false };
      accounts[email] = 'uid-' + email.split('@')[0];
      return { uid: accounts[email], created: true };
    },
    inviteLink: async (email) => 'https://example.test/set-password?e=' + encodeURIComponent(email),
    revokeSessions: async (uid) => { revoked.push(uid); },
  };
}
