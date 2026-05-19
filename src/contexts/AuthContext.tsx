import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { User } from 'firebase/auth';
import {
  isFirebaseConfigured,
  initFirebaseAuth,
  signInWithGoogle,
  signOutUser,
} from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(isFirebaseConfigured());
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setIsLoading(false);
      return;
    }

    let unsub: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      try {
        unsub = await initFirebaseAuth((nextUser) => {
          if (cancelled) return;
          setUser(nextUser);
          if (nextUser) setAuthError(null);
          setIsLoading(false);
        });
      } catch (err) {
        console.error('Firebase auth init failed', err);
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Google sign-in failed. Please try again.';
          setAuthError(message);
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  const signIn = async () => {
    setAuthError(null);
    await signInWithGoogle();
  };

  const signOut = async () => {
    await signOutUser();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    authError,
    signIn,
    signOut,
    clearAuthError: () => setAuthError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
