/** SERVER-ONLY: the Firebase-backed MemberIdentity. Needs firebase-admin (see roleAdmin.ts). */
import { type Auth as AdminAuth } from 'firebase-admin/auth';
import type { App } from 'firebase-admin/app';
import type { MemberIdentity } from '../members';
export declare function makeFirebaseMemberIdentity(app?: App, auth?: AdminAuth): MemberIdentity;
//# sourceMappingURL=memberIdentity.d.ts.map