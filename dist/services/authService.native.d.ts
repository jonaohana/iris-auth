import { User, Auth } from 'firebase/auth';
import { AuthConfig } from '../types';
export declare class AuthService {
    private config;
    private auth;
    constructor(auth: Auth, config: AuthConfig);
    signInWithGoogle(): Promise<User>;
    signInWithFacebook(): Promise<User>;
    signInWithApple(): Promise<User>;
    signInWithEmail(email: string, password: string): Promise<User>;
    signUpWithEmail(email: string, password: string): Promise<User>;
    signOut(): Promise<void>;
}
//# sourceMappingURL=authService.native.d.ts.map