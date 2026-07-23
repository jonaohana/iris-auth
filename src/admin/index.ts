/**
 * `@iris/auth/admin` — SERVER-ONLY role management.
 *
 * Import ONLY from server code (Cloud Functions, a Node backend). This entry
 * point pulls in `firebase-admin` and must never reach a client bundle.
 *
 *   import { RoleAdmin, makeSetRoleCallable } from '@iris/auth/admin';
 */
export { RoleAdmin, ROLE_CLAIM, PERMISSIONS_CLAIM } from './roleAdmin';
export type { RoleGrant } from './roleAdmin';
export {
  RoleAuthError,
  assertAuthenticated,
  assertRole,
  makeSetRoleCallable,
  makeAssignDefaultRoleTrigger,
} from './functions';
export type {
  CallableAuthLike,
  SetRoleData,
  SetRoleCallableOptions,
  AssignDefaultRoleOptions,
} from './functions';
