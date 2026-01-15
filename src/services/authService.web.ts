import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithCredential,
  PhoneAuthProvider,
  RecaptchaVerifier,
  ConfirmationResult,
  signOut as firebaseSignOut,
  User,
  Auth,
} from 'firebase/auth';
import { AuthConfig } from '../types';

export class AuthService {
  private config: AuthConfig;
  private auth: Auth;

  constructor(auth: Auth, config: AuthConfig) {
    this.auth = auth;
    this.config = config;
  }

  async signInWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('🔑 Starting Google sign-in with popup...');
      const result = await signInWithPopup(this.auth, provider);
      console.log('✅ Sign-in successful:', result.user.email);
      return result.user;
    } catch (error: any) {
      console.error('❌ Google sign-in error:', error.code, error.message);
      throw error;
    }
  }

  async signInWithFacebook(): Promise<User> {
    try {
      const provider = new FacebookAuthProvider();
      // Don't add any scopes - use Facebook defaults
      // Email scope requires App Review approval
      
      console.log('🔑 Starting Facebook sign-in with popup...');
      const result = await signInWithPopup(this.auth, provider);
      console.log('✅ Sign-in successful:', result.user.email);
      return result.user;
    } catch (error: any) {
      console.error('❌ Facebook sign-in error:', error.code, error.message);
      throw error;
    }
  }

  async signInWithApple(): Promise<User> {
    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      
      console.log('🔑 Starting Apple sign-in with popup...');
      const result = await signInWithPopup(this.auth, provider);
      console.log('✅ Sign-in successful');
      return result.user;
    } catch (error: any) {
      console.error('❌ Apple sign-in error:', error.code, error.message);
      throw error;
    }
  }

  async signInWithPhone(phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> {
    try {
      console.log('🔑 Starting phone sign-in...');
      const confirmationResult = await signInWithPhoneNumber(this.auth, phoneNumber, appVerifier);
      console.log('✅ SMS sent successfully');
      return confirmationResult;
    } catch (error: any) {
      console.error('❌ Phone sign-in error:', error.code, error.message);
      throw error;
    }
  }

  async verifyPhoneCode(verificationId: string, code: string): Promise<User> {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      const result = await signInWithCredential(this.auth, credential);
      console.log('✅ Phone verification successful');
      return result.user;
    } catch (error: any) {
      console.error('❌ Phone verification error:', error.code, error.message);
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
