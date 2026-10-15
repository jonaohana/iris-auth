"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeMemberGuards = makeMemberGuards;
// Express-style middleware for a backend: who is calling, which scope, and may they do this?
// The scope is chosen by the request but ALWAYS verified against the caller's memberships, so it cannot be forged.
const access_1 = require("../access");
const catalog_1 = require("./catalog");
/** Sets `req.member` and `req.scope` (what routes should filter by, e.g. storeId) on success. */
function makeMemberGuards({ catalog, store, getUid, isEmailVerified, getClaims, scopeFrom }) {
    const requirePermission = (permission) => async (req, res, next) => {
        try {
            const uid = getUid(req);
            if (!uid)
                return res.status(401).json({ error: 'Sign in required' });
            if (!isEmailVerified(req))
                return res.status(403).json({ error: 'Verify your email to continue' });
            const claims = getClaims?.(req);
            const admin = !!claims && (0, access_1.hasAppRole)(claims, catalog.app, 'admin');
            const asked = scopeFrom?.(req) || undefined;
            let member = null;
            if (asked) {
                member = await store.get(asked, uid);
            }
            else {
                const mine = (await store.listForUser(uid)).filter((m) => m.active);
                if (mine.length > 1)
                    return res.status(400).json({ error: 'Choose which store or team to use' });
                member = mine[0] ?? null;
            }
            const scope = asked ?? member?.scope;
            if (!scope)
                return res.status(403).json({ error: 'Not allowed' });
            if (!admin && !(0, catalog_1.can)(catalog, member, permission))
                return res.status(403).json({ error: 'Not allowed' });
            req.member = member;
            req.scope = scope;
            return next();
        }
        catch (err) {
            console.error('member guard failed', err instanceof Error ? err.message : err);
            return res.status(500).json({ error: 'Could not check access' });
        }
    };
    return { requirePermission };
}
