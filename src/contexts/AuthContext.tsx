import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: () => void;
  signOut: () => void;
  getUserStorageKey: (key: string) => string;
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
  const [isLoading, setIsLoading] = useState(true);

  // Function to handle credential response from Google Sign-In
  const handleCredentialResponse = (response: any) => {
    try {
      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      setUser({
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        imageUrl: payload.picture,
      });
      
      console.log('User signed in:', payload);
    } catch (error) {
      console.error('Error parsing credential response:', error);
    }
  };

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      // Get client ID from meta tag
      const metaTag = document.querySelector('meta[name="google-signin-client_id"]');
      const clientId = metaTag?.getAttribute('content');
      
      if (!clientId) {
        console.error('No Google client ID found');
        setIsLoading(false);
        return;
      }

      try {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        console.log('Google Sign-In initialized successfully');
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
      }
      
      setIsLoading(false);
    };

    // Function to check if Google API is ready
    const checkGoogleApi = () => {
      return typeof window !== 'undefined' && 
             (window as any).google?.accounts?.id;
    };

    // Try to initialize if API is ready
    if (checkGoogleApi()) {
      initializeGoogleSignIn();
      return;
    }

    // If API is not ready, wait for it
    const timer = setInterval(() => {
      if (checkGoogleApi()) {
        clearInterval(timer);
        initializeGoogleSignIn();
      }
    }, 100);

    // Clean up interval on unmount
    return () => clearInterval(timer);
  }, []);

  const signIn = () => {
    if (typeof window !== 'undefined' && (window as any).google) {
      (window as any).google.accounts.id.prompt();
    }
  };

  const signOut = () => {
    if (typeof window !== 'undefined' && (window as any).google) {
      (window as any).google.accounts.id.disableAutoSelect();
      setUser(null);
      // Clear all user-specific data
      const keysToRemove = [
        'repackr_master_items',
        'repackr_daily_boards',
        'repackr_view_preference',
        'repackr_packed_items',
        'repackr_tutorial_completed'
      ];
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
    }
  };

  const getUserStorageKey = (key: string): string => {
    return user ? `${key}_${user.id}` : key;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signOut,
    getUserStorageKey,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
