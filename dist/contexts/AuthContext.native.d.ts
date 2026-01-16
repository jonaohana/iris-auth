import React, { ReactNode } from 'react';
import { Auth } from 'firebase/auth';
import { AuthContextValue, AuthConfig } from '../types';
interface AuthProviderProps {
    auth?: Auth;
    config: AuthConfig;
    children: ReactNode;
}
export declare const AuthProvider: React.FC<AuthProviderProps>;
export declare const useAuth: () => AuthContextValue;
export {};
//# sourceMappingURL=AuthContext.native.d.ts.map