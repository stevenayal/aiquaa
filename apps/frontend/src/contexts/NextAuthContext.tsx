'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { postJson } from '@/lib/api';

interface RegisterData {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface NextAuthContextType {
  user: any;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signInWithCredentials: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string; message?: string }>;
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
        callbackUrl: '/ranking',
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
        callbackUrl: '/ranking',
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

  const signInWithCredentials = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });
      
      if (result?.error) {
        return { success: false, error: result.error };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error signing in with credentials:', error);
      return { success: false, error: 'Error inesperado en el inicio de sesión' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);

      // Validar que las contraseñas coincidan
      if (userData.password !== userData.confirmPassword) {
        return { success: false, error: 'Las contraseñas no coinciden' };
      }

      // Usar el nuevo cliente API estandarizado
      const data = await postJson('/api/v1/auth/register', {
        email: userData.email,
        name: userData.name,
        password: userData.password,
      });

      // Si el registro es exitoso, devolver éxito con mensaje
      return {
        success: true,
        message: data.message || 'Usuario registrado exitosamente. Por favor verifica tu email.'
      };
    } catch (error) {
      console.error('Error in registration:', error);

      // Manejo detallado de errores
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      // Detectar errores de red/CORS
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('status:0')) {
        console.error('Network/CORS Error in registration:', {
          error: errorMessage,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        });
        return {
          success: false,
          error: 'No se pudo contactar con el servidor. Verificá tu conexión a internet.',
          message: 'Error de conexión'
        };
      }
      
      // Detectar errores HTTP específicos
      if (errorMessage.includes('HTTP 409')) {
        return {
          success: false,
          error: 'Este email ya está registrado. Intenta iniciar sesión o usa otro email.',
          message: errorMessage
        };
      }
      
      if (errorMessage.includes('HTTP 400')) {
        return {
          success: false,
          error: 'Los datos proporcionados no son válidos. Verifica la información.',
          message: errorMessage
        };
      }
      
      // Error genérico
      return {
        success: false,
        error: errorMessage || 'Error inesperado. Intenta nuevamente.',
        message: errorMessage
      };
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
    signInWithCredentials,
    register,
    logout,
    isAuthenticated: !!session?.user,
  };

  return (
    <NextAuthContext.Provider value={value}>
      {children}
    </NextAuthContext.Provider>
  );
};
