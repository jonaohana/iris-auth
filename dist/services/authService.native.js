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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const auth_1 = require("firebase/auth");
const react_native_1 = require("react-native");
const WebBrowser = __importStar(require("expo-web-browser"));
const expo_auth_session_1 = require("expo-auth-session");
const google_1 = require("expo-auth-session/providers/google");
const facebook_1 = require("expo-auth-session/providers/facebook");
const Application = __importStar(require("expo-application"));
const Crypto = __importStar(require("expo-crypto"));
// Lets the auth browser session (ASWebAuthenticationSession on iOS, Custom Tabs
// on Android) hand the OAuth redirect back to JS once the provider returns to
// the app via our custom URL scheme.
WebBrowser.maybeCompleteAuthSession();
// Same minimum scopes expo-auth-session's Google provider applies — `openid` is
// what makes Google return the id_token Firebase needs.
const GOOGLE_SCOPES = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
];
// Default (no-review) Facebook permissions; both are needed for Firebase to
// populate email + displayName.
const FACEBOOK_SCOPES = ['public_profile', 'email'];
function randomHex(byteCount) {
    return Array.from(Crypto.getRandomBytes(byteCount), (b) => b.toString(16).padStart(2, '0')).join('');
}
/** Returns a friendly error message for Firebase / OAuth errors (mirrors authService.web.ts). */
function friendlyAuthError(error, provider) {
    const code = error?.code;
    if (code === 'auth/account-exists-with-different-credential') {
        const email = error.customData?.email;
        return email
            ? `An account for ${email} already exists. Please sign in with the method you used originally (e.g. Google or email/password), then link additional sign-in methods in your account settings.`
            : 'This email is already registered with a different sign-in method. Please use that method to sign in.';
    }
    if (code === 'auth/user-disabled')
        return 'This account has been disabled. Please contact support.';
    if (code === 'auth/operation-not-allowed') {
        return provider
            ? `${provider} sign-in is not enabled for this Firebase project. Enable it under Authentication → Sign-in method.`
            : 'This sign-in method is not enabled. Please contact support.';
    }
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        return provider
            ? `${provider} sign-in was rejected by Firebase. Check that the ${provider} client ID / app ID in the app matches the one configured in Firebase Authentication → Sign-in method.`
            : 'Incorrect email or password.';
    }
    if (code === 'auth/user-not-found')
        return 'No account found with that email.';
    if (code === 'auth/email-already-in-use')
        return 'An account with this email already exists.';
    if (code === 'auth/too-many-requests')
        return 'Too many attempts. Please wait a moment and try again.';
    if (code === 'auth/network-request-failed')
        return 'Network error. Please check your connection and try again.';
    return error?.message || 'Authentication failed. Please try again.';
}
/** Throws a friendly error unless the auth session completed successfully. */
function assertAuthSessionSuccess(result, provider) {
    if (result.type === 'success')
        return;
    if (result.type === 'cancel' || result.type === 'dismiss') {
        throw new Error(`${provider} sign-in was cancelled.`);
    }
    if (result.type === 'locked') {
        throw new Error(`Another ${provider} sign-in is already in progress.`);
    }
    if (result.type === 'error') {
        const description = result.params?.error_description ||
            result.error?.message ||
            result.params?.error;
        throw new Error(description ? `${provider} sign-in failed: ${description}` : `${provider} sign-in failed.`);
    }
    throw new Error(`${provider} sign-in failed.`);
}
class AuthService {
    constructor(auth, config) {
        this.auth = auth;
        this.config = config;
    }
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
    async signInWithGoogle() {
        const clientIdKey = react_native_1.Platform.OS === 'ios' ? 'googleIosClientId' : 'googleAndroidClientId';
        const clientId = this.config[clientIdKey];
        if (!clientId) {
            throw new Error(`Google Sign-In is not configured for ${react_native_1.Platform.OS}: pass \`${clientIdKey}\` in the <AuthProvider config> (EXPO_PUBLIC_GOOGLE_${react_native_1.Platform.OS === 'ios' ? 'IOS' : 'ANDROID'}_CLIENT_ID).`);
        }
        const redirectUri = this.config.googleRedirectUri ??
            this.config.redirectUri ??
            (0, expo_auth_session_1.makeRedirectUri)({ native: `${Application.applicationId}:/oauthredirect` });
        try {
            const request = new expo_auth_session_1.AuthRequest({
                clientId,
                redirectUri,
                responseType: expo_auth_session_1.ResponseType.Code,
                usePKCE: true,
                scopes: GOOGLE_SCOPES,
                prompt: expo_auth_session_1.Prompt.SelectAccount,
            });
            console.log('🔑 Starting Google sign-in (expo-auth-session)…', { redirectUri });
            const result = await request.promptAsync(google_1.discovery);
            assertAuthSessionSuccess(result, 'Google');
            const tokens = await (0, expo_auth_session_1.exchangeCodeAsync)({
                clientId,
                code: result.params.code,
                redirectUri,
                extraParams: { code_verifier: request.codeVerifier ?? '' },
            }, google_1.discovery);
            if (!tokens.idToken) {
                throw new Error('Google did not return an ID token. Make sure the OAuth client is an iOS / Android client (not a Web client).');
            }
            const credential = auth_1.GoogleAuthProvider.credential(tokens.idToken, tokens.accessToken);
            const { user } = await (0, auth_1.signInWithCredential)(this.auth, credential);
            console.log('✅ Google sign-in successful:', user.email);
            return user;
        }
        catch (error) {
            console.error('❌ Google sign-in error:', error?.code, error?.message);
            throw new Error(friendlyAuthError(error, 'Google'));
        }
    }
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
    async signInWithFacebook() {
        const appId = this.config.facebookAppId;
        if (!appId) {
            throw new Error('Facebook Login is not configured: pass `facebookAppId` in the <AuthProvider config> (EXPO_PUBLIC_FACEBOOK_APP_ID).');
        }
        const redirectUri = this.config.facebookRedirectUri ?? (0, expo_auth_session_1.makeRedirectUri)({ native: `fb${appId}://authorize` });
        try {
            const request = new expo_auth_session_1.AuthRequest({
                clientId: appId,
                redirectUri,
                responseType: expo_auth_session_1.ResponseType.Token,
                usePKCE: false,
                scopes: FACEBOOK_SCOPES,
                extraParams: { auth_nonce: randomHex(16) },
            });
            console.log('🔑 Starting Facebook sign-in (expo-auth-session)…', { redirectUri });
            const result = await request.promptAsync(facebook_1.discovery);
            assertAuthSessionSuccess(result, 'Facebook');
            const accessToken = result.params.access_token ?? result.authentication?.accessToken;
            if (!accessToken) {
                throw new Error('Facebook did not return an access token.');
            }
            const credential = auth_1.FacebookAuthProvider.credential(accessToken);
            const { user } = await (0, auth_1.signInWithCredential)(this.auth, credential);
            console.log('✅ Facebook sign-in successful:', user.email);
            return user;
        }
        catch (error) {
            console.error('❌ Facebook sign-in error:', error?.code, error?.message);
            throw new Error(friendlyAuthError(error, 'Facebook'));
        }
    }
    /**
     * Apple via the system sheet (expo-apple-authentication). iOS only — on
     * Android Apple requires a web flow with an https return URL (needs a
     * backend), so the LoginScreen hides the button there.
     *
     * The host app must: `npx expo install expo-apple-authentication`, add it to
     * `plugins` + set `ios.usesAppleSignIn: true`, enable Sign in with Apple on
     * the App ID in the Apple Developer portal, then rebuild.
     */
    async signInWithApple() {
        if (react_native_1.Platform.OS !== 'ios') {
            throw new Error('Sign in with Apple is only available on iOS.');
        }
        // Lazy-required so a host app that hasn't installed / rebuilt with the
        // native module still gets working Google / Facebook / email sign-in.
        let AppleAuthentication;
        try {
            AppleAuthentication = require('expo-apple-authentication');
        }
        catch (err) {
            console.error('❌ expo-apple-authentication unavailable:', err);
            throw new Error('Sign in with Apple is not available in this build: install expo-apple-authentication, add it to the app plugins, and rebuild the iOS app.');
        }
        try {
            if (!(await AppleAuthentication.isAvailableAsync())) {
                throw new Error('Sign in with Apple is not available on this device (needs iOS 13+ and the Sign in with Apple capability in the build).');
            }
            // Firebase requires a nonce: Apple gets the SHA-256 hash, Firebase gets the
            // raw value and verifies the two match (replay protection).
            const rawNonce = randomHex(16);
            const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
            console.log('🔑 Starting Apple sign-in…');
            const appleCredential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
                nonce: hashedNonce,
            });
            if (!appleCredential.identityToken) {
                throw new Error('Apple did not return an identity token.');
            }
            const provider = new auth_1.OAuthProvider('apple.com');
            const credential = provider.credential({ idToken: appleCredential.identityToken, rawNonce });
            const { user } = await (0, auth_1.signInWithCredential)(this.auth, credential);
            // Apple only sends the name on the FIRST authorization for this app and
            // Firebase doesn't copy it to the profile — persist it now or it's gone.
            const { givenName, familyName } = appleCredential.fullName ?? {};
            const displayName = [givenName, familyName].filter(Boolean).join(' ');
            if (displayName && !user.displayName) {
                try {
                    await (0, auth_1.updateProfile)(user, { displayName });
                }
                catch (err) {
                    console.warn('[@iris/auth] Could not save Apple display name:', err);
                }
            }
            console.log('✅ Apple sign-in successful');
            return user;
        }
        catch (error) {
            if (error?.code === 'ERR_REQUEST_CANCELED' || error?.code === 'ERR_CANCELED') {
                throw new Error('Apple sign-in was cancelled.');
            }
            console.error('❌ Apple sign-in error:', error?.code, error?.message);
            throw new Error(friendlyAuthError(error, 'Apple'));
        }
    }
    async signInWithEmail(email, password) {
        try {
            const result = await (0, auth_1.signInWithEmailAndPassword)(this.auth, email, password);
            return result.user;
        }
        catch (error) {
            throw new Error(friendlyAuthError(error));
        }
    }
    async signUpWithEmail(email, password) {
        try {
            const result = await (0, auth_1.createUserWithEmailAndPassword)(this.auth, email, password);
            return result.user;
        }
        catch (error) {
            throw new Error(friendlyAuthError(error));
        }
    }
    async signOut() {
        await (0, auth_1.signOut)(this.auth);
    }
}
exports.AuthService = AuthService;
