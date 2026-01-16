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
const WebBrowser = __importStar(require("expo-web-browser"));
const AppleAuthentication = __importStar(require("expo-apple-authentication"));
WebBrowser.maybeCompleteAuthSession();
class AuthService {
    constructor(auth, config) {
        this.auth = auth;
        this.config = config;
    }
    async signInWithGoogle() {
        // Use expo-auth-session for native Google Sign-In
        // Note: This requires proper setup - for now throw error
        throw new Error('Google Sign-In on native requires expo-auth-session setup. Please use web version or implement native flow.');
    }
    async signInWithFacebook() {
        // Facebook Sign-In on native requires expo-facebook or expo-auth-session setup
        throw new Error('Facebook Sign-In on native requires expo-facebook setup. Please use web version or implement native flow.');
    }
    async signInWithApple() {
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });
            const provider = new auth_1.OAuthProvider('apple.com');
            const firebaseCredential = provider.credential({
                idToken: credential.identityToken,
            });
            const result = await (0, auth_1.signInWithCredential)(this.auth, firebaseCredential);
            return result.user;
        }
        catch (error) {
            if (error.code === 'ERR_CANCELED') {
                throw new Error('Apple Sign-In was cancelled');
            }
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
