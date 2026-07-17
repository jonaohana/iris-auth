"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const auth_1 = require("firebase/auth");
/** Returns a friendly error message for Firebase auth errors. */
function friendlyAuthError(error) {
    if (error.code === 'auth/account-exists-with-different-credential') {
        const email = error.customData?.email;
        // Firebase lets us look up which provider the email is registered with.
        return email
            ? `An account for ${email} already exists. Please sign in with the method you used originally (e.g. Google or email/password), then link additional sign-in methods in your account settings.`
            : 'This email is already registered with a different sign-in method. Please use that method to sign in.';
    }
    if (error.code === 'auth/popup-closed-by-user')
        return 'Sign-in popup was closed. Please try again.';
    if (error.code === 'auth/popup-blocked')
        return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
    if (error.code === 'auth/cancelled-popup-request')
        return ''; // silent — another popup opened
    if (error.code === 'auth/user-disabled')
        return 'This account has been disabled. Please contact support.';
    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential')
        return 'Incorrect email or password.';
    if (error.code === 'auth/user-not-found')
        return 'No account found with that email.';
    if (error.code === 'auth/email-already-in-use')
        return 'An account with this email already exists.';
    if (error.code === 'auth/too-many-requests')
        return 'Too many attempts. Please wait a moment and try again.';
    return error.message || 'Authentication failed. Please try again.';
}
class AuthService {
    constructor(auth, config) {
        this.auth = auth;
        this.config = config;
    }
    async signInWithGoogle() {
        try {
            const provider = new auth_1.GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account'
            });
            console.log('🔑 Starting Google sign-in with popup...');
            const result = await (0, auth_1.signInWithPopup)(this.auth, provider);
            console.log('✅ Sign-in successful:', result.user.email);
            return result.user;
        }
        catch (error) {
            console.error('❌ Google sign-in error:', error.code, error.message);
            throw new Error(friendlyAuthError(error));
        }
    }
    async signInWithFacebook() {
        try {
            const provider = new auth_1.FacebookAuthProvider();
            // Don't add any scopes - use Facebook defaults
            // Email scope requires App Review approval
            console.log('🔑 Starting Facebook sign-in with popup...');
            const result = await (0, auth_1.signInWithPopup)(this.auth, provider);
            console.log('✅ Sign-in successful:', result.user.email);
            return result.user;
        }
        catch (error) {
            console.error('❌ Facebook sign-in error:', error.code, error.message);
            throw new Error(friendlyAuthError(error));
        }
    }
    async signInWithApple() {
        try {
            const provider = new auth_1.OAuthProvider('apple.com');
            provider.addScope('email');
            provider.addScope('name');
            console.log('🔑 Starting Apple sign-in with popup...');
            const result = await (0, auth_1.signInWithPopup)(this.auth, provider);
            console.log('✅ Sign-in successful');
            return result.user;
        }
        catch (error) {
            console.error('❌ Apple sign-in error:', error.code, error.message);
            throw new Error(friendlyAuthError(error));
        }
    }
    async signInWithPhone(phoneNumber, appVerifier) {
        try {
            console.log('🔑 Starting phone sign-in...');
            const confirmationResult = await (0, auth_1.signInWithPhoneNumber)(this.auth, phoneNumber, appVerifier);
            console.log('✅ SMS sent successfully');
            return confirmationResult;
        }
        catch (error) {
            console.error('❌ Phone sign-in error:', error.code, error.message);
            throw error;
        }
    }
    async verifyPhoneCode(verificationId, code) {
        try {
            const credential = auth_1.PhoneAuthProvider.credential(verificationId, code);
            const result = await (0, auth_1.signInWithCredential)(this.auth, credential);
            console.log('✅ Phone verification successful');
            return result.user;
        }
        catch (error) {
            console.error('❌ Phone verification error:', error.code, error.message);
            throw error;
        }
    }
    async signInWithEmail(email, password) {
        const result = await (0, auth_1.signInWithEmailAndPassword)(this.auth, email, password);
        return result.user;
    }
    async signUpWithEmail(email, password) {
        const result = await (0, auth_1.createUserWithEmailAndPassword)(this.auth, email, password);
        return result.user;
    }
    async signOut() {
        await (0, auth_1.signOut)(this.auth);
    }
}
exports.AuthService = AuthService;
