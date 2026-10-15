// Members: people who hold a role inside one scope (a store, team, org...) of one app.
// Identity comes from Firebase; WHICH scope and role lives in the app's own database behind MembershipStore.
// Keeping membership in the app DB means removal is immediate, there is no claims size limit, and one person
// can belong to many scopes.

export interface RoleDef {
  /** Display title, e.g. "Store manager". */
  title: string;
  /** Higher = more powerful. You can only manage roles strictly below your own. */
  level: number;
  /** What the role allows, e.g. 'products.write'. '*' allows everything; 'orders.*' allows a whole area. */
  permissions: string[];
}

export interface RoleCatalog {
  /** Lowercase app name, matches the `apps` claim (e.g. 'ganjahub'). */
  app: string;
  roles: Record<string, RoleDef>;
}

/** Permissions the member service itself checks. Put them on the roles that should manage the team. */
export const MEMBERS_VIEW = 'members.view';
export const MEMBERS_MANAGE = 'members.manage';

export interface Member {
  uid: string;
  email: string;
  name?: string;
  /** The store / team / org id inside the app. */
  scope: string;
  role: string;
  /** Free-form display title overriding the role's title (e.g. "Night shift lead"). */
  title?: string;
  /** Extra permissions on top of the role. */
  permissions?: string[];
  active: boolean;
}

/** Each app implements this over its own table (ganjahub: StoreStaff). Everything is scoped, never global. */
export interface MembershipStore {
  get(scope: string, uid: string): Promise<Member | null>;
  list(scope: string): Promise<Member[]>;
  /** Every scope the user belongs to. */
  listForUser(uid: string): Promise<Member[]>;
  /** Insert or update by (scope, uid). */
  save(member: Member): Promise<void>;
  remove(scope: string, uid: string): Promise<void>;
}

/** The sign-in system behind the members: Firebase in production (see admin/memberIdentity), a fake in tests. */
export interface MemberIdentity {
  /**
   * Finds the account for this email or creates it. `created` is true for a brand-new account; `verified` says whether
   * the email has been proven (an unverified account may belong to someone who merely typed the address in).
   */
  findOrCreate(email: string, name?: string): Promise<{ uid: string; created: boolean; verified: boolean }>;
  /** A link the new person opens to choose their own password. The app emails it. */
  inviteLink(email: string): Promise<string | null>;
  /** Ends every session of the user so a removal takes effect now. */
  revokeSessions(uid: string): Promise<void>;
}

export class MemberError extends Error {
  constructor(
    message: string,
    public code: 'unauthenticated' | 'forbidden' | 'invalid' | 'not-found' | 'conflict' = 'invalid',
  ) {
    super(message);
    this.name = 'MemberError';
  }
}
