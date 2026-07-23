import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, Auth } from 'firebase/auth';
import { AuthService } from '../services/authService.web';
import { AuthContextValue, AuthUser, AuthConfig, Role, Permission } from '../types';
import { extractRoleInfo, checkRole, checkPermission, DEFAULT_SUPER_ROLES } from './roleHelpers';

/**
 * Build an AuthUser from a Firebase user, reading role/permissions from its ID
 * token custom claims. `forceRefresh` re-fetches the token from the server so
 * newly-assigned claims are picked up immediately.
 */
async function toAuthUser(firebaseUser: User, forceRefresh = false): Promise<AuthUser> {
  let claims: Record<string, any> = {};
  try {
    const tokenResult = await firebaseUser.getIdTokenResult(forceRefresh);
    claims = (tokenResult.claims as Record<string, any>) || {};
  } catch (err) {
    console.error('[@iris/auth] Failed to read ID token claims:', err);
  }
  const { role, permissions } = extractRoleInfo(claims);
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    phoneNumber: firebaseUser.phoneNumber,
    role,
    permissions,
    claims,
  };
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  auth?: Auth;
  config: AuthConfig;
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ auth: authProp, config, children }) => {
  // Lazy load default auth only if not provided
  const [auth] = useState(() => {
    if (authProp) return authProp;
    // Only import and initialize if no auth provided
    const { auth: defaultAuth } = require('../config/firebase.web');
    return defaultAuth;
  });
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authService] = useState(() => new AuthService(auth, config));

  useEffect(() => {
    // Add a small delay to ensure Firebase is fully initialized
    let unsubscribe: (() => void) | undefined;
    
    const setupAuthListener = async () => {
      try {
        // Wait a tick to ensure auth is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            const authUser = await toAuthUser(firebaseUser);
            // Log everything we know about the authenticated user
            console.log('[@iris/auth] Signed in \u2014 user info:', {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              phoneNumber: firebaseUser.phoneNumber,
              isAnonymous: firebaseUser.isAnonymous,
              providers: firebaseUser.providerData.map((p) => p.providerId),
              createdAt: firebaseUser.metadata?.creationTime,
              lastSignInAt: firebaseUser.metadata?.lastSignInTime,
              role: authUser.role,
              permissions: authUser.permissions,
            });
            setUser(authUser);
          } else {
            console.log('[@iris/auth] Signed out \u2014 no user');
            setUser(null);
          }
          setLoading(false);
        });
      } catch (err) {
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

  const handleAuth = async (authFn: () => Promise<any>) => {
    try {
      setError(null);
      await authFn();
    } catch (err: any) {
      const errorMessage = err.message || 'Authentication failed';
      setError(errorMessage);
      throw err;
    }
  };

  const superRoles = config.superRoles ?? DEFAULT_SUPER_ROLES;

  const refreshUser = async () => {
    const current = auth.currentUser;
    if (!current) {
      setUser(null);
      return;
    }
    const authUser = await toAuthUser(current, /* forceRefresh */ true);
    setUser(authUser);
  };

  const value: AuthContextValue = {
    user,
    loading,
    error,
    signInWithGoogle: () => handleAuth(() => authService.signInWithGoogle()),
    signInWithApple: () => handleAuth(() => authService.signInWithApple()),
    signInWithFacebook: () => handleAuth(() => authService.signInWithFacebook()),
    signInWithEmail: (email, password) =>
      handleAuth(() => authService.signInWithEmail(email, password)),
    signUpWithEmail: (email, password) =>
      handleAuth(() => authService.signUpWithEmail(email, password)),
    signInWithPhone: async (phoneNumber, appVerifier) => {
      setError(null);
      return authService.signInWithPhone(phoneNumber, appVerifier);
    },
    verifyPhoneCode: (verificationId, code) =>
      handleAuth(() => authService.verifyPhoneCode(verificationId, code)),
    signOut: () => handleAuth(() => authService.signOut()),
    refreshUser,
    hasRole: (role) => checkRole(user, role),
    hasPermission: (permission) => checkPermission(user, permission, superRoles),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
