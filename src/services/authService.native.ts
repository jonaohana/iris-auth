import {
  signInWithCredential,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
  Auth,
} from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import { AuthConfig } from '../types';

WebBrowser.maybeCompleteAuthSession();

export class AuthService {
  private config: AuthConfig;
  private auth: Auth;

  constructor(auth: Auth, config: AuthConfig) {
    this.auth = auth;
    this.config = config;
  }

  async signInWithGoogle(): Promise<User> {
    // Use expo-auth-session for native Google Sign-In
    // Note: This requires proper setup - for now throw error
    throw new Error('Google Sign-In on native requires expo-auth-session setup. Please use web version or implement native flow.');
  }

  async signInWithFacebook(): Promise<User> {
    // Facebook Sign-In on native requires expo-facebook or expo-auth-session setup
    throw new Error('Facebook Sign-In on native requires expo-facebook setup. Please use web version or implement native flow.');
  }

  async signInWithApple(): Promise<User> {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const provider = new OAuthProvider('apple.com');
      const firebaseCredential = provider.credential({
        idToken: credential.identityToken!,
      });

      const result = await signInWithCredential(this.auth, firebaseCredential);
      return result.user;
    } catch (error: any) {
      if (error.code === 'ERR_CANCELED') {
        throw new Error('Apple Sign-In was cancelled');
      }
      throw error;
    }
  }

  async signInWithEmail(email: string, password: string): Promise<User> {
    const result = await signInWithEmailAndPassword(this.auth, email, password);
    return result.user;
  }

  async signUpWithEmail(email: string, password: string): Promise<User> {
    const result = await createUserWithEmailAndPassword(this.auth, email, password);
    return result.user;
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(this.auth);
  }
}
