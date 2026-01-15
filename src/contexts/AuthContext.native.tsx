import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, Auth } from 'firebase/auth';
import { AuthService } from '../services/authService.native';
import { AuthContextValue, AuthUser, AuthConfig } from '../types';

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
    const { auth: defaultAuth } = require('../config/firebase.native');
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
        
        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            });
          } else {
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
    signOut: () => handleAuth(() => authService.signOut()),
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
