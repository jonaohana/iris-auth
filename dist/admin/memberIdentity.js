"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeFirebaseMemberIdentity = makeFirebaseMemberIdentity;
/** SERVER-ONLY: the Firebase-backed MemberIdentity. Needs firebase-admin (see roleAdmin.ts). */
const auth_1 = require("firebase-admin/auth");
function makeFirebaseMemberIdentity(app, auth) {
    const a = auth ?? (0, auth_1.getAuth)(app);
    return {
        async findOrCreate(email, name) {
            try {
                const user = await a.getUserByEmail(email);
                if (user.disabled)
                    throw new Error('That account is disabled.');
                return { uid: user.uid, created: false };
            }
            catch (err) {
                if (err?.code !== 'auth/user-not-found')
                    throw err;
                const user = await a.createUser({ email, displayName: name, emailVerified: false });
                return { uid: user.uid, created: true };
            }
        },
        // Firebase generates the link but cannot email it: the app sends it with its own mailer.
        inviteLink: (email) => a.generatePasswordResetLink(email),
        async revokeSessions(uid) {
            await a.revokeRefreshTokens(uid);
        },
    };
}
