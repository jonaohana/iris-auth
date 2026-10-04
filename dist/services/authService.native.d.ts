import { User, Auth } from 'firebase/auth';
import { AuthConfig } from '../types';
export declare class AuthService {
    private config;
    private auth;
    constructor(auth: Auth, config: AuthConfig);
    /**
     * Google via expo-auth-session: authorization-code + PKCE against the iOS /
     * Android OAuth client. Installed apps exchange the code WITHOUT a client
     * secret and get both an `id_token` (for Firebase) and an `access_token`.
     *
     * Redirect URI defaults to `<bundleId|package>:/oauthredirect` — the same
     * default expo-auth-session's own Google provider uses. Expo prebuild already
     * registers the bundle id / package as a URL scheme, so nothing extra is
     * needed in app.config.js; the OAuth client in Google Cloud just has to be
     * created for that bundle id / package (+ SHA-1 on Android).
     */
    signInWithGoogle(): Promise<User>;
    /**
     * Facebook via expo-auth-session: implicit (`response_type=token`) flow —
     * Facebook returns the access_token straight in the redirect, which is all
     * `FacebookAuthProvider.credential()` needs.
     *
     * Redirect URI defaults to `fb<APP_ID>://authorize` (what the Facebook SDK
     * itself uses). The host app must register `fb<APP_ID>` as a URL scheme
     * (`scheme` in app.config.js) and list its bundle id / package under the
     * Facebook app's iOS / Android platform settings.
     */
    signInWithFacebook(): Promise<User>;
    /**
     * Apple via the system sheet (expo-apple-authentication). iOS only — on
     * Android Apple requires a web flow with an https return URL (needs a
     * backend), so the LoginScreen hides the button there.
     *
     * The host app must: `npx expo install expo-apple-authentication`, add it to
     * `plugins` + set `ios.usesAppleSignIn: true`, enable Sign in with Apple on
     * the App ID in the Apple Developer portal, then rebuild.
     */
    signInWithApple(): Promise<User>;
    signInWithEmail(email: string, password: string): Promise<User>;
    signUpWithEmail(email: string, password: string): Promise<User>;
    signOut(): Promise<void>;
}
//# sourceMappingURL=authService.native.d.ts.map