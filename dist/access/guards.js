"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeGuards = makeGuards;
// Express-style guards built on the tiers. Framework-light on purpose: no express import, just (req, res, next).
// Each app supplies one function that returns the verified caller's claims (see AI_CONTEXT "Access tiers").
const claims_1 = require("./claims");
function makeGuards(getClaims) {
    const run = (check, forbidden) => (req, res, next) => {
        const claims = getClaims(req);
        if (!claims)
            return res.status(401).json({ error: 'Sign in required' });
        if (!check(claims, req))
            return res.status(403).json({ error: forbidden });
        return next();
    };
    return {
        requireSuperAdmin: run((c) => (0, claims_1.isSuperAdmin)(c), 'Super admin only'),
        requireApp: (app, min = 'admin') => run((c) => (0, claims_1.hasAppRole)(c, app, min), 'Not allowed'),
        /** `idFrom` reads the store / team id out of the request (params, body, or a lookup the app already did). */
        requireTenant: (app, idFrom, min = 'staff') => run((c, req) => { const id = idFrom(req); return !!id && (0, claims_1.hasTenantRole)(c, app, id, min); }, 'Not allowed for this store'),
        /** Passes for an app admin OR an explicit member of the tenant: the usual rule for a store's own back office. */
        requireTenantOrAppAdmin: (app, idFrom, min = 'staff') => run((c, req) => { const id = idFrom(req); return (0, claims_1.hasAppRole)(c, app, 'admin') || (!!id && (0, claims_1.hasTenantRole)(c, app, id, min)); }, 'Not allowed for this store'),
    };
}
