export interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    phoneNumber?: string | null;
}
export interface AuthConfig {
    googleWebClientId?: string;
    googleIosClientId?: string;
    googleAndroidClientId?: string;
    appleEnabled?: boolean;
    emailPasswordEnabled?: boolean;
    phoneEnabled?: boolean;
    facebookAppId?: string;
    facebookAppSecret?: string;
    redirectUri?: string;
}
export interface AuthContextValue {
    user: AuthUser | null;
    loading: boolean;
    error: string | null;
    signInWithGoogle: () => Promise<void>;
    signInWithApple: () => Promise<void>;
    signInWithFacebook: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<void>;
    signInWithPhone: (phoneNumber: string, appVerifier: any) => Promise<any>;
    verifyPhoneCode: (verificationId: string, code: string) => Promise<void>;
    signOut: () => Promise<void>;
}
export type AuthProvider = 'google' | 'apple' | 'facebook' | 'email' | 'phone';
export interface LoginScreenProps {
    onLoginSuccess?: () => void;
    showSignUp?: boolean;
}
//# sourceMappingURL=index.d.ts.map