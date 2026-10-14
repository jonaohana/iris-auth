import { AccessClaims, AppRole, TenantRole } from './claims';
type Req = any;
type Res = {
    status: (code: number) => {
        json: (body: unknown) => unknown;
    };
};
type Next = () => void;
export type ClaimsGetter = (req: Req) => AccessClaims | null | undefined;
export declare function makeGuards(getClaims: ClaimsGetter): {
    requireSuperAdmin: (req: Req, res: Res, next: Next) => unknown;
    requireApp: (app: string, min?: AppRole) => (req: Req, res: Res, next: Next) => unknown;
    /** `idFrom` reads the store / team id out of the request (params, body, or a lookup the app already did). */
    requireTenant: (app: string, idFrom: (req: Req) => string | undefined, min?: TenantRole) => (req: Req, res: Res, next: Next) => unknown;
    /** Passes for an app admin OR an explicit member of the tenant: the usual rule for a store's own back office. */
    requireTenantOrAppAdmin: (app: string, idFrom: (req: Req) => string | undefined, min?: TenantRole) => (req: Req, res: Res, next: Next) => unknown;
};
export {};
//# sourceMappingURL=guards.d.ts.map