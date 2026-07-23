// Re-export everything from the TypeScript source
export { AuthProvider, useAuth } from './src/contexts/AuthContext';
export { LoginScreen } from './src/components/LoginScreen';
export { AuthButton } from './src/components/AuthButton';
export { HelloBearButton } from './src/components/HelloBearButton';
export { theme } from './src/theme';
export { RoleGate } from './src/components/RoleGate';
export { useHasRole, useHasPermission, useRole, usePermissions } from './src/hooks/useRoles';
