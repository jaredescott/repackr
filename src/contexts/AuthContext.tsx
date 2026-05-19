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
  signInWithGoogle,
  signOutUser,
  subscribeAuth,
} from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  localMode: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  setLocalMode: (value: boolean) => void;
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
  const [localMode, setLocalMode] = useState(() => {
    try {
      return localStorage.getItem('repackr-local-mode') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setIsLoading(false);
      return;
    }

    return subscribeAuth((nextUser) => {
      setUser(nextUser);
      setIsLoading(false);
    });
  }, []);

  const handleSetLocalMode = (value: boolean) => {
    setLocalMode(value);
    try {
      if (value) {
        localStorage.setItem('repackr-local-mode', '1');
      } else {
        localStorage.removeItem('repackr-local-mode');
      }
    } catch {
      /* ignore */
    }
  };

  const signIn = async () => {
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
    localMode,
    signIn,
    signOut,
    setLocalMode: handleSetLocalMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
