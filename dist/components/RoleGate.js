"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleGate = void 0;
const react_1 = __importDefault(require("react"));
const AuthContext_1 = require("../contexts/AuthContext");
/**
 * Conditionally renders children based on the current user's role/permissions.
 * Cross-platform (web + native) — it only renders, it does not gate any data,
 * so always enforce authorization on the server / in security rules too.
 *
 * @example
 * <RoleGate role="admin" fallback={<NoAccess />}>
 *   <AdminPanel />
 * </RoleGate>
 *
 * <RoleGate permission={['billing.read', 'billing.write']}>
 *   <BillingSettings />
 * </RoleGate>
 */
const RoleGate = ({ role, permission, requireAll = true, fallback = null, loadingFallback = null, children, }) => {
    const { loading, hasRole, hasPermission } = (0, AuthContext_1.useAuth)();
    if (loading)
        return react_1.default.createElement(react_1.default.Fragment, null, loadingFallback);
    const checks = [];
    if (role !== undefined)
        checks.push(hasRole(role));
    if (permission !== undefined)
        checks.push(hasPermission(permission));
    // No constraints given → treat as "any signed-in-aware" gate that passes.
    const allowed = checks.length === 0
        ? true
        : requireAll
            ? checks.every(Boolean)
            : checks.some(Boolean);
    return react_1.default.createElement(react_1.default.Fragment, null, allowed ? children : fallback);
};
exports.RoleGate = RoleGate;
