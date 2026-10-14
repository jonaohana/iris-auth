// Express-style guards built on the tiers. Framework-light on purpose: no express import, just (req, res, next).
// Each app supplies one function that returns the verified caller's claims (see AI_CONTEXT "Access tiers").
import { AccessClaims, AppRole, TenantRole, hasAppRole, hasTenantRole, isSuperAdmin } from './claims';

type Req = any;
type Res = { status: (code: number) => { json: (body: unknown) => unknown } };
type Next = () => void;
export type ClaimsGetter = (req: Req) => AccessClaims | null | undefined;

export function makeGuards(getClaims: ClaimsGetter) {
  const run = (check: (c: AccessClaims, req: Req) => boolean, forbidden: string) => (req: Req, res: Res, next: Next) => {
    const claims = getClaims(req);
    if (!claims) return res.status(401).json({ error: 'Sign in required' });
    if (!check(claims, req)) return res.status(403).json({ error: forbidden });
    return next();
  };
  return {
    requireSuperAdmin: run((c) => isSuperAdmin(c), 'Super admin only'),
    requireApp: (app: string, min: AppRole = 'admin') => run((c) => hasAppRole(c, app, min), 'Not allowed'),
    /** `idFrom` reads the store / team id out of the request (params, body, or a lookup the app already did). */
    requireTenant: (app: string, idFrom: (req: Req) => string | undefined, min: TenantRole = 'staff') =>
      run((c, req) => { const id = idFrom(req); return !!id && hasTenantRole(c, app, id, min); }, 'Not allowed for this store'),
    /** Passes for an app admin OR an explicit member of the tenant: the usual rule for a store's own back office. */
    requireTenantOrAppAdmin: (app: string, idFrom: (req: Req) => string | undefined, min: TenantRole = 'staff') =>
      run((c, req) => { const id = idFrom(req); return hasAppRole(c, app, 'admin') || (!!id && hasTenantRole(c, app, id, min)); }, 'Not allowed for this store'),
  };
}
