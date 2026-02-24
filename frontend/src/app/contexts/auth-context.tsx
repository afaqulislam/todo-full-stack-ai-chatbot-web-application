'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/src/utils/api';

type AuthState = 'unknown' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
  user: any;
  authState: AuthState;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [authState, setAuthState] = useState<AuthState>('unknown');
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setAuthState('unknown');

    try {
      // Simple auth check without retry mechanism
      const userData = await authApi.getUser();

      if (userData) {
        setUser(userData);
        setAuthState('authenticated');
      } else {
        // No user data but no error - user is not authenticated
        setUser(null);
        setAuthState('unauthenticated');
      }
    } catch (error: any) {
      // Check if this is a network error vs auth error
      if (error.message && error.message.includes('Network error')) {
        // Network error - user might be authenticated but network is down
        // Default to unauthenticated
        setAuthState('unauthenticated');
        setUser(null);
      } else {
        // Authentication error (likely 401) - user is unauthenticated
        setUser(null);
        setAuthState('unauthenticated');
      }
    }
  };

  const login = async () => {
    try {
      // Wait to ensure cookie is properly set by the browser
      // This is critical for cookie synchronization after login
      await new Promise(resolve => setTimeout(resolve, 150)); // Reduced delay for better UX

      // Verify that the cookie is actually available before proceeding
      const userData = await authApi.getUser();
      if (userData) {
        setUser(userData);
        setAuthState('authenticated');
      } else {
        // If we couldn't verify the cookie, check auth status
        await checkAuthStatus();
      }
    } catch (error) {
      console.error('Error updating auth state after login:', error);
      await checkAuthStatus(); // Fallback to checking auth status
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error: any) {
      // Don't treat errors as failures, just clear local state
      if (!(error.message && error.message.includes('Network error'))) {
        console.error('Logout API call failed:', error);
      }
    } finally {
      setUser(null);
      setAuthState('unauthenticated');
      router.push('/auth/login');
    }
  };

  const value = {
    user,
    authState,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}