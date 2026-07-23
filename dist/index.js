"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SUPER_ROLES = exports.extractRoleInfo = exports.checkPermission = exports.checkRole = exports.usePermissions = exports.useRole = exports.useHasPermission = exports.useHasRole = exports.RoleGate = exports.theme = exports.VantaBackground = exports.PhoneLoginInput = exports.MobileUserBadge = exports.UserBadge = exports.HelloBearButton = exports.AuthButton = exports.LoginScreen = exports.useAuth = exports.AuthProvider = void 0;
// Components
var AuthContext_1 = require("./contexts/AuthContext");
Object.defineProperty(exports, "AuthProvider", { enumerable: true, get: function () { return AuthContext_1.AuthProvider; } });
Object.defineProperty(exports, "useAuth", { enumerable: true, get: function () { return AuthContext_1.useAuth; } });
var LoginScreen_1 = require("./components/LoginScreen");
Object.defineProperty(exports, "LoginScreen", { enumerable: true, get: function () { return LoginScreen_1.LoginScreen; } });
var AuthButton_1 = require("./components/AuthButton");
Object.defineProperty(exports, "AuthButton", { enumerable: true, get: function () { return AuthButton_1.AuthButton; } });
var HelloBearButton_1 = require("./components/HelloBearButton");
Object.defineProperty(exports, "HelloBearButton", { enumerable: true, get: function () { return HelloBearButton_1.HelloBearButton; } });
var UserBadge_1 = require("./components/UserBadge");
Object.defineProperty(exports, "UserBadge", { enumerable: true, get: function () { return UserBadge_1.UserBadge; } });
var MobileUserBadge_1 = require("./components/MobileUserBadge");
Object.defineProperty(exports, "MobileUserBadge", { enumerable: true, get: function () { return MobileUserBadge_1.MobileUserBadge; } });
var PhoneLoginInput_1 = require("./components/PhoneLoginInput");
Object.defineProperty(exports, "PhoneLoginInput", { enumerable: true, get: function () { return PhoneLoginInput_1.PhoneLoginInput; } });
var VantaBackground_1 = require("./components/VantaBackground");
Object.defineProperty(exports, "VantaBackground", { enumerable: true, get: function () { return VantaBackground_1.VantaBackground; } });
var theme_1 = require("./theme");
Object.defineProperty(exports, "theme", { enumerable: true, get: function () { return theme_1.theme; } });
// Roles & permissions (client)
var RoleGate_1 = require("./components/RoleGate");
Object.defineProperty(exports, "RoleGate", { enumerable: true, get: function () { return RoleGate_1.RoleGate; } });
var useRoles_1 = require("./hooks/useRoles");
Object.defineProperty(exports, "useHasRole", { enumerable: true, get: function () { return useRoles_1.useHasRole; } });
Object.defineProperty(exports, "useHasPermission", { enumerable: true, get: function () { return useRoles_1.useHasPermission; } });
Object.defineProperty(exports, "useRole", { enumerable: true, get: function () { return useRoles_1.useRole; } });
Object.defineProperty(exports, "usePermissions", { enumerable: true, get: function () { return useRoles_1.usePermissions; } });
var roleHelpers_1 = require("./contexts/roleHelpers");
Object.defineProperty(exports, "checkRole", { enumerable: true, get: function () { return roleHelpers_1.checkRole; } });
Object.defineProperty(exports, "checkPermission", { enumerable: true, get: function () { return roleHelpers_1.checkPermission; } });
Object.defineProperty(exports, "extractRoleInfo", { enumerable: true, get: function () { return roleHelpers_1.extractRoleInfo; } });
Object.defineProperty(exports, "DEFAULT_SUPER_ROLES", { enumerable: true, get: function () { return roleHelpers_1.DEFAULT_SUPER_ROLES; } });
// Re-export all types from types file
__exportStar(require("./types"), exports);
