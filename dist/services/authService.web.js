"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const auth_1 = require("firebase/auth");
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
            throw error;
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
            throw error;
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
            throw error;
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
