import { AccessClaims } from '../access';
import { MembershipStore, RoleCatalog } from './types';
type Req = any;
type Res = {
    status: (code: number) => {
        json: (body: unknown) => unknown;
    };
};
type Next = () => void;
export interface MemberGuardOptions {
    catalog: RoleCatalog;
    store: MembershipStore;
    /** The verified Firebase uid for this request, or null when not signed in. */
    getUid: (req: Req) => string | null | undefined;
    getClaims?: (req: Req) => AccessClaims | null | undefined;
    /** Where the request names its scope (header, param...). Optional when users belong to one scope. */
    scopeFrom?: (req: Req) => string | null | undefined;
}
/** Sets `req.member` and `req.scope` (what routes should filter by, e.g. storeId) on success. */
export declare function makeMemberGuards({ catalog, store, getUid, getClaims, scopeFrom }: MemberGuardOptions): {
    requirePermission: (permission: string) => (req: Req, res: Res, next: Next) => Promise<unknown>;
};
export {};
//# sourceMappingURL=guards.d.ts.map