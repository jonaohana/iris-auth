// Components
export { AuthProvider, useAuth } from './contexts/AuthContext';
export { LoginScreen } from './components/LoginScreen';
export { AuthButton } from './components/AuthButton';
export { HelloBearButton } from './components/HelloBearButton';
export { UserBadge } from './components/UserBadge';
export { MobileUserBadge } from './components/MobileUserBadge';
export type { MobileUserBadgeProps } from './components/MobileUserBadge';
export { PhoneLoginInput } from './components/PhoneLoginInput';
export { VantaBackground } from './components/VantaBackground';
export { theme } from './theme';

// Roles & permissions (client)
export { RoleGate } from './components/RoleGate';
export type { RoleGateProps } from './components/RoleGate';
export { useHasRole, useHasPermission, useRole, usePermissions, useIsSuperAdmin, useHasAppRole, useHasTenantRole } from './hooks/useRoles';
export { checkRole, checkPermission, extractRoleInfo, DEFAULT_SUPER_ROLES } from './contexts/roleHelpers';

// Access tiers: super admin / per-app admin / per-store roles (pure; also importable as '@iris/auth/access')
export * from './access';

// Re-export all types from types file
export * from './types';

