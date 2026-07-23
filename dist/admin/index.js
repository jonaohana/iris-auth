"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeAssignDefaultRoleTrigger = exports.makeSetRoleCallable = exports.assertRole = exports.assertAuthenticated = exports.RoleAuthError = exports.PERMISSIONS_CLAIM = exports.ROLE_CLAIM = exports.RoleAdmin = void 0;
/**
 * `@iris/auth/admin` — SERVER-ONLY role management.
 *
 * Import ONLY from server code (Cloud Functions, a Node backend). This entry
 * point pulls in `firebase-admin` and must never reach a client bundle.
 *
 *   import { RoleAdmin, makeSetRoleCallable } from '@iris/auth/admin';
 */
var roleAdmin_1 = require("./roleAdmin");
Object.defineProperty(exports, "RoleAdmin", { enumerable: true, get: function () { return roleAdmin_1.RoleAdmin; } });
Object.defineProperty(exports, "ROLE_CLAIM", { enumerable: true, get: function () { return roleAdmin_1.ROLE_CLAIM; } });
Object.defineProperty(exports, "PERMISSIONS_CLAIM", { enumerable: true, get: function () { return roleAdmin_1.PERMISSIONS_CLAIM; } });
var functions_1 = require("./functions");
Object.defineProperty(exports, "RoleAuthError", { enumerable: true, get: function () { return functions_1.RoleAuthError; } });
Object.defineProperty(exports, "assertAuthenticated", { enumerable: true, get: function () { return functions_1.assertAuthenticated; } });
Object.defineProperty(exports, "assertRole", { enumerable: true, get: function () { return functions_1.assertRole; } });
Object.defineProperty(exports, "makeSetRoleCallable", { enumerable: true, get: function () { return functions_1.makeSetRoleCallable; } });
Object.defineProperty(exports, "makeAssignDefaultRoleTrigger", { enumerable: true, get: function () { return functions_1.makeAssignDefaultRoleTrigger; } });
