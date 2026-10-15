import { Member, RoleCatalog, RoleDef } from './types';
/** Throws on a malformed catalog so a typo fails at startup, not when someone is locked out. */
export declare function defineCatalog(catalog: RoleCatalog): RoleCatalog;
export declare const roleOf: (catalog: RoleCatalog, role: string) => RoleDef | null;
/** Does a granted permission cover the wanted one? '*' covers all; 'orders.*' covers 'orders.view'. */
export declare function covers(granted: string, wanted: string): boolean;
/** Everything the member may do: their role's permissions plus personal extras. Inactive members can do nothing. */
export declare function permissionsOf(catalog: RoleCatalog, member: Member | null | undefined): string[];
export declare function can(catalog: RoleCatalog, member: Member | null | undefined, permission: string): boolean;
export declare const levelOf: (catalog: RoleCatalog, member: Member | null | undefined) => number;
export declare function assertRole(catalog: RoleCatalog, role: string): RoleDef;
export declare function validPermission(p: unknown): p is string;
//# sourceMappingURL=catalog.d.ts.map