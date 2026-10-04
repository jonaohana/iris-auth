import {
  signInWithCredential,
  updateProfile,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
  Auth,
} from 'firebase/auth';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import {
  AuthRequest,
  AuthSessionResult,
  Prompt,
  ResponseType,
  exchangeCodeAsync,
  makeRedirectUri,
} from 'expo-auth-session';
import { discovery as googleDiscovery } from 'expo-auth-session/providers/google';
import { discovery as facebookDiscovery } from 'expo-auth-session/providers/facebook';
import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';
import { AuthConfig } from '../types';

// Lets the auth browser session (ASWebAuthenticationSession on iOS, Custom Tabs
// on Android) hand the OAuth redirect back to JS once the provider returns to
// the app via our custom URL scheme.
WebBrowser.maybeCompleteAuthSession();

/**
 * Native social sign-in.
 *
 * Google and Facebook go through `expo-auth-session` (no Firebase popups on
 * native) and hand Firebase a credential via `signInWithCredential`; Apple uses
 * the system sheet from `expo-apple-authentication`. See
 * `NATIVE_SOCIAL_SIGNIN.md` for the console / app-config setup each one needs.
 */

type SocialProvider = 'Google' | 'Facebook' | 'Apple';

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

/**
 * The slice of `expo-apple-authentication` we use. Typed locally (instead of
 * `typeof import('expo-apple-authentication')`) because the package is an
 * optional peer — host apps without it must still typecheck.
 */
type AppleAuthenticationModule = {
  isAvailableAsync(): Promise<boolean>;
  AppleAuthenticationScope: { FULL_NAME: number; EMAIL: number };
  signInAsync(options: { requestedScopes?: number[]; nonce?: string; state?: string }): Promise<{
    user: string;
    identityToken: string | null;
    authorizationCode: string | null;
    email: string | null;
    fullName: { givenName: string | null; familyName: string | null } | null;
  }>;
};

function randomHex(byteCount: number): string {
  return Array.from(Crypto.getRandomBytes(byteCount), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Returns a friendly error message for Firebase / OAuth errors (mirrors authService.web.ts). */
function friendlyAuthError(error: any, provider?: SocialProvider): string {
  const code = error?.code;
  if (code === 'auth/account-exists-with-different-credential') {
    const email = error.customData?.email as string | undefined;
    return email
      ? `An account for ${email} already exists. Please sign in with the method you used originally (e.g. Google or email/password), then link additional sign-in methods in your account settings.`
      : 'This email is already registered with a different sign-in method. Please use that method to sign in.';
  }
  if (code === 'auth/user-disabled') return 'This account has been disabled. Please contact support.';
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
  if (code === 'auth/user-not-found') return 'No account found with that email.';
  if (code === 'auth/email-already-in-use') return 'An account with this email already exists.';
  if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait a moment and try again.';
  if (code === 'auth/network-request-failed') return 'Network error. Please check your connection and try again.';
  return error?.message || 'Authentication failed. Please try again.';
}

/** Throws a friendly error unless the auth session completed successfully. */
function assertAuthSessionSuccess(
  result: AuthSessionResult,
  provider: SocialProvider,
): asserts result is AuthSessionResult & { type: 'success' } {
  if (result.type === 'success') return;
  if (result.type === 'cancel' || result.type === 'dismiss') {
    throw new Error(`${provider} sign-in was cancelled.`);
  }
  if (result.type === 'locked') {
    throw new Error(`Another ${provider} sign-in is already in progress.`);
  }
  if (result.type === 'error') {
    const description =
      result.params?.error_description ||
      (result.error as unknown as { message?: string } | null | undefined)?.message ||
      result.params?.error;
    throw new Error(description ? `${provider} sign-in failed: ${description}` : `${provider} sign-in failed.`);
  }
  throw new Error(`${provider} sign-in failed.`);
}

export class AuthService {
  private config: AuthConfig;
  private auth: Auth;

  constructor(auth: Auth, config: AuthConfig) {
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
  async signInWithGoogle(): Promise<User> {
    const clientIdKey = Platform.OS === 'ios' ? 'googleIosClientId' : 'googleAndroidClientId';
    const clientId = this.config[clientIdKey];
    if (!clientId) {
      throw new Error(
        `Google Sign-In is not configured for ${Platform.OS}: pass \`${clientIdKey}\` in the <AuthProvider config> (EXPO_PUBLIC_GOOGLE_${Platform.OS === 'ios' ? 'IOS' : 'ANDROID'}_CLIENT_ID).`,
      );
    }
    const redirectUri =
      this.config.googleRedirectUri ??
      this.config.redirectUri ??
      makeRedirectUri({ native: `${Application.applicationId}:/oauthredirect` });

    try {
      const request = new AuthRequest({
        clientId,
        redirectUri,
        responseType: ResponseType.Code,
        usePKCE: true,
        scopes: GOOGLE_SCOPES,
        prompt: Prompt.SelectAccount,
      });

      console.log('🔑 Starting Google sign-in (expo-auth-session)…', { redirectUri });
      const result = await request.promptAsync(googleDiscovery);
      assertAuthSessionSuccess(result, 'Google');

      const tokens = await exchangeCodeAsync(
        {
          clientId,
          code: result.params.code,
          redirectUri,
          extraParams: { code_verifier: request.codeVerifier ?? '' },
        },
        googleDiscovery,
      );
      if (!tokens.idToken) {
        throw new Error(
          'Google did not return an ID token. Make sure the OAuth client is an iOS / Android client (not a Web client).',
        );
      }

      const credential = GoogleAuthProvider.credential(tokens.idToken, tokens.accessToken);
      const { user } = await signInWithCredential(this.auth, credential);
      console.log('✅ Google sign-in successful:', user.email);
      return user;
    } catch (error: any) {
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
  async signInWithFacebook(): Promise<User> {
    const appId = this.config.facebookAppId;
    if (!appId) {
      throw new Error(
        'Facebook Login is not configured: pass `facebookAppId` in the <AuthProvider config> (EXPO_PUBLIC_FACEBOOK_APP_ID).',
      );
    }
    const redirectUri = this.config.facebookRedirectUri ?? makeRedirectUri({ native: `fb${appId}://authorize` });

    try {
      const request = new AuthRequest({
        clientId: appId,
        redirectUri,
        responseType: ResponseType.Token,
        usePKCE: false,
        scopes: FACEBOOK_SCOPES,
        extraParams: { auth_nonce: randomHex(16) },
      });

      console.log('🔑 Starting Facebook sign-in (expo-auth-session)…', { redirectUri });
      const result = await request.promptAsync(facebookDiscovery);
      assertAuthSessionSuccess(result, 'Facebook');

      const accessToken = result.params.access_token ?? result.authentication?.accessToken;
      if (!accessToken) {
        throw new Error('Facebook did not return an access token.');
      }

      const credential = FacebookAuthProvider.credential(accessToken);
      const { user } = await signInWithCredential(this.auth, credential);
      console.log('✅ Facebook sign-in successful:', user.email);
      return user;
    } catch (error: any) {
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
  async signInWithApple(): Promise<User> {
    if (Platform.OS !== 'ios') {
      throw new Error('Sign in with Apple is only available on iOS.');
    }

    // Lazy-required so a host app that hasn't installed / rebuilt with the
    // native module still gets working Google / Facebook / email sign-in.
    let AppleAuthentication: AppleAuthenticationModule;
    try {
      AppleAuthentication = require('expo-apple-authentication') as AppleAuthenticationModule;
    } catch (err) {
      console.error('❌ expo-apple-authentication unavailable:', err);
      throw new Error(
        'Sign in with Apple is not available in this build: install expo-apple-authentication, add it to the app plugins, and rebuild the iOS app.',
      );
    }

    try {
      if (!(await AppleAuthentication.isAvailableAsync())) {
        throw new Error(
          'Sign in with Apple is not available on this device (needs iOS 13+ and the Sign in with Apple capability in the build).',
        );
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

      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({ idToken: appleCredential.identityToken, rawNonce });
      const { user } = await signInWithCredential(this.auth, credential);

      // Apple only sends the name on the FIRST authorization for this app and
      // Firebase doesn't copy it to the profile — persist it now or it's gone.
      const { givenName, familyName } = appleCredential.fullName ?? {};
      const displayName = [givenName, familyName].filter(Boolean).join(' ');
      if (displayName && !user.displayName) {
        try {
          await updateProfile(user, { displayName });
        } catch (err) {
          console.warn('[@iris/auth] Could not save Apple display name:', err);
        }
      }

      console.log('✅ Apple sign-in successful');
      return user;
    } catch (error: any) {
      if (error?.code === 'ERR_REQUEST_CANCELED' || error?.code === 'ERR_CANCELED') {
        throw new Error('Apple sign-in was cancelled.');
      }
      console.error('❌ Apple sign-in error:', error?.code, error?.message);
      throw new Error(friendlyAuthError(error, 'Apple'));
    }
  }

  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      return result.user;
    } catch (error: any) {
      throw new Error(friendlyAuthError(error));
    }
  }

  async signUpWithEmail(email: string, password: string): Promise<User> {
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      return result.user;
    } catch (error: any) {
      throw new Error(friendlyAuthError(error));
    }
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(this.auth);
  }
}
