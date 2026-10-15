import { AccessClaims } from '../access';
import { Member, MemberIdentity, MembershipStore, RoleCatalog } from './types';
export interface Caller {
    uid: string;
    claims: AccessClaims;
}
export interface InviteInput {
    email: string;
    name?: string;
    role: string;
    title?: string;
    permissions?: string[];
}
export interface ChangeInput {
    role?: string;
    title?: string | null;
    permissions?: string[];
    active?: boolean;
}
export interface InviteResult {
    member: Member; /** Present only for a brand-new account: email it to them. */
    inviteLink: string | null;
}
export interface MemberServiceOptions {
    catalog: RoleCatalog;
    store: MembershipStore;
    identity: MemberIdentity;
}
export declare function makeMemberService({ catalog, store, identity }: MemberServiceOptions): {
    /** Add someone to the scope, creating their sign-in if they have none. */
    invite(caller: Caller, scope: string, input: InviteInput): Promise<InviteResult>;
    /** Change role, title, extra permissions, or switch the person off/on. */
    change(caller: Caller, scope: string, uid: string, input: ChangeInput): Promise<Member>;
    /** Take someone off the scope. Their sign-in itself is untouched (they may be a customer too). */
    remove(caller: Caller, scope: string, uid: string): Promise<void>;
    list(caller: Caller, scope: string): Promise<Member[]>;
    /** The scopes the signed-in user works in, for the app's "which store?" picker. */
    mine(uid: string): Promise<Member[]>;
};
export type MemberService = ReturnType<typeof makeMemberService>;
//# sourceMappingURL=service.d.ts.map