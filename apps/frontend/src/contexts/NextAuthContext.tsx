'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

interface NextAuthContextType {
  user: any;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const NextAuthContext = createContext<NextAuthContextType | undefined>(undefined);

export const useNextAuth = () => {
  const context = useContext(NextAuthContext);
  if (context === undefined) {
    throw new Error('useNextAuth must be used within a NextAuthProvider');
  }
  return context;
};

export const NextAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [status]);

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const result = await signIn('google', { 
        callbackUrl: '/forum',
        redirect: false 
      });
      
      if (result?.error) {
        throw new Error(result.error);
      }
      
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGitHub = async () => {
    try {
      setIsLoading(true);
      const result = await signIn('github', { 
        callbackUrl: '/forum',
        redirect: false 
      });
      
      if (result?.error) {
        throw new Error(result.error);
      }
      
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Error signing in with GitHub:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value: NextAuthContextType = {
    user: session?.user || null,
    isLoading,
    signInWithGoogle,
    signInWithGitHub,
    logout,
    isAuthenticated: !!session?.user,
  };

  return (
    <NextAuthContext.Provider value={value}>
      {children}
    </NextAuthContext.Provider>
  );
};
