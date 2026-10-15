import { Member, MemberIdentity, MembershipStore } from './types';
export declare function createMemoryMembershipStore(seed?: Member[]): MembershipStore & {
    all(): Member[];
};
export declare function createMemoryIdentity(existing?: Record<string, string>, unverified?: string[]): MemberIdentity & {
    revoked: string[];
    accounts: Record<string, string>;
};
//# sourceMappingURL=memory.d.ts.map