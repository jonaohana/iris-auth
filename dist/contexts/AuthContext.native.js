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
exports.useAuth = exports.AuthProvider = void 0;
const react_1 = __importStar(require("react"));
const auth_1 = require("firebase/auth");
const authService_native_1 = require("../services/authService.native");
const AuthContext = (0, react_1.createContext)(undefined);
const AuthProvider = ({ auth: authProp, config, children }) => {
    // Lazy load default auth only if not provided
    const [auth] = (0, react_1.useState)(() => {
        if (authProp)
            return authProp;
        // Only import and initialize if no auth provided
        const { auth: defaultAuth } = require('../config/firebase.native');
        return defaultAuth;
    });
    const [user, setUser] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [authService] = (0, react_1.useState)(() => new authService_native_1.AuthService(auth, config));
    (0, react_1.useEffect)(() => {
        // Add a small delay to ensure Firebase is fully initialized
        let unsubscribe;
        const setupAuthListener = async () => {
            try {
                // Wait a tick to ensure auth is ready
                await new Promise(resolve => setTimeout(resolve, 100));
                unsubscribe = (0, auth_1.onAuthStateChanged)(auth, (firebaseUser) => {
                    if (firebaseUser) {
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            photoURL: firebaseUser.photoURL,
                        });
                    }
                    else {
                        setUser(null);
                    }
                    setLoading(false);
                });
            }
            catch (err) {
                console.error('Error setting up auth listener:', err);
                setLoading(false);
            }
        };
        setupAuthListener();
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);
    const handleAuth = async (authFn) => {
        try {
            setError(null);
            await authFn();
        }
        catch (err) {
            const errorMessage = err.message || 'Authentication failed';
            setError(errorMessage);
            throw err;
        }
    };
    const value = {
        user,
        loading,
        error,
        signInWithGoogle: () => handleAuth(() => authService.signInWithGoogle()),
        signInWithApple: () => handleAuth(() => authService.signInWithApple()),
        signInWithFacebook: () => handleAuth(() => authService.signInWithFacebook()),
        signInWithEmail: (email, password) => handleAuth(() => authService.signInWithEmail(email, password)),
        signUpWithEmail: (email, password) => handleAuth(() => authService.signUpWithEmail(email, password)),
        signOut: () => handleAuth(() => authService.signOut()),
    };
    return react_1.default.createElement(AuthContext.Provider, { value: value }, children);
};
exports.AuthProvider = AuthProvider;
const useAuth = () => {
    const context = (0, react_1.useContext)(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
exports.useAuth = useAuth;
