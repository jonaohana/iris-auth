// Express-style middleware for a backend: who is calling, which scope, and may they do this?
// The scope is chosen by the request but ALWAYS verified against the caller's memberships, so it cannot be forged.
import { AccessClaims, hasAppRole } from '../access';
import { can } from './catalog';
import { Member, MembershipStore, RoleCatalog } from './types';

type Req = any;
type Res = { status: (code: number) => { json: (body: unknown) => unknown } };
type Next = () => void;

export interface MemberGuardOptions {
  catalog: RoleCatalog;
  store: MembershipStore;
  /** The verified Firebase uid for this request, or null when not signed in. */
  getUid: (req: Req) => string | null | undefined;
  /** Whether the verified token's email is verified. Required: an unverified address proves nothing about who owns it. */
  isEmailVerified: (req: Req) => boolean;
  getClaims?: (req: Req) => AccessClaims | null | undefined;
  /** Where the request names its scope (header, param...). Optional when users belong to one scope. */
  scopeFrom?: (req: Req) => string | null | undefined;
}

/** Sets `req.member` and `req.scope` (what routes should filter by, e.g. storeId) on success. */
export function makeMemberGuards({ catalog, store, getUid, isEmailVerified, getClaims, scopeFrom }: MemberGuardOptions) {
  const requirePermission = (permission: string) => async (req: Req, res: Res, next: Next) => {
    try {
      const uid = getUid(req);
      if (!uid) return res.status(401).json({ error: 'Sign in required' });
      if (!isEmailVerified(req)) return res.status(403).json({ error: 'Verify your email to continue' });
      const claims = getClaims?.(req);
      const admin = !!claims && hasAppRole(claims, catalog.app, 'admin');

      const asked = scopeFrom?.(req) || undefined;
      let member: Member | null = null;
      if (asked) {
        member = await store.get(asked, uid);
      } else {
        const mine = (await store.listForUser(uid)).filter((m) => m.active);
        if (mine.length > 1) return res.status(400).json({ error: 'Choose which store or team to use' });
        member = mine[0] ?? null;
      }
      const scope = asked ?? member?.scope;
      if (!scope) return res.status(403).json({ error: 'Not allowed' });
      if (!admin && !can(catalog, member, permission)) return res.status(403).json({ error: 'Not allowed' });

      req.member = member;
      req.scope = scope;
      return next();
    } catch (err) {
      console.error('member guard failed', err instanceof Error ? err.message : err);
      return res.status(500).json({ error: 'Could not check access' });
    }
  };
  return { requirePermission };
}
