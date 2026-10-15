/** SERVER-ONLY: the Firebase-backed MemberIdentity. Needs firebase-admin (see roleAdmin.ts). */
import { getAuth, type Auth as AdminAuth } from 'firebase-admin/auth';
import type { App } from 'firebase-admin/app';
import type { MemberIdentity } from '../members';

export function makeFirebaseMemberIdentity(app?: App, auth?: AdminAuth): MemberIdentity {
  const a = auth ?? getAuth(app);
  return {
    async findOrCreate(email, name) {
      try {
        const user = await a.getUserByEmail(email);
        if (user.disabled) throw new Error('That account is disabled.');
        return { uid: user.uid, created: false, verified: !!user.emailVerified };
      } catch (err: any) {
        if (err?.code !== 'auth/user-not-found') throw err;
        const user = await a.createUser({ email, displayName: name, emailVerified: false });
        return { uid: user.uid, created: true, verified: false };
      }
    },
    // Firebase generates the link but cannot email it: the app sends it with its own mailer.
    inviteLink: (email) => a.generatePasswordResetLink(email),
    async revokeSessions(uid) {
      await a.revokeRefreshTokens(uid);
    },
  };
}
