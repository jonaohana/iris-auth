import { RecaptchaVerifier, ConfirmationResult, User, Auth } from 'firebase/auth';
import { AuthConfig } from '../types';
export declare class AuthService {
    private config;
    private auth;
    constructor(auth: Auth, config: AuthConfig);
    signInWithGoogle(): Promise<User>;
    signInWithFacebook(): Promise<User>;
    signInWithApple(): Promise<User>;
    signInWithPhone(phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult>;
    verifyPhoneCode(verificationId: string, code: string): Promise<User>;
    signInWithEmail(email: string, password: string): Promise<User>;
    signUpWithEmail(email: string, password: string): Promise<User>;
    signOut(): Promise<void>;
}
//# sourceMappingURL=authService.web.d.ts.map