'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { fetchJSON, FetchError } from '@/lib/fetch-with-timeout';

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

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      // Llamar al endpoint de registro del backend con timeout y retry
      const { data } = await fetchJSON(`${apiUrl}/api/v1/auth/register`, {
        method: 'POST',
        body: JSON.stringify({
          email: userData.email,
          name: userData.name,
          password: userData.password,
        }),
        timeout: 15000, // 15 segundos timeout
        retries: 1, // 1 retry
        retryDelay: 2000, // 2 segundos entre reintentos
      });

      // Si el registro es exitoso, devolver éxito con mensaje
      return {
        success: true,
        message: data.message || 'Usuario registrado exitosamente. Por favor verifica tu email.'
      };
    } catch (error) {
      console.error('Error in registration:', error);

      // Manejo detallado de errores
      if (error instanceof FetchError) {
        if (error.isTimeout) {
          return {
            success: false,
            error: 'El servidor tardó demasiado en responder. Intenta nuevamente.',
            message: 'Timeout del servidor'
          };
        }

        if (error.isNetworkError) {
          return {
            success: false,
            error: 'No se pudo conectar con el servidor. Verifica tu conexión a internet o contacta al administrador.',
            message: 'Error de conexión'
          };
        }

        // Errores HTTP con código de estado
        if (error.statusCode === 409) {
          return {
            success: false,
            error: 'Este email ya está registrado. Intenta iniciar sesión o usa otro email.',
            message: error.message
          };
        }

        if (error.statusCode === 400) {
          return {
            success: false,
            error: 'Los datos proporcionados no son válidos. Verifica la información.',
            message: error.message
          };
        }

        return {
          success: false,
          error: error.message,
          message: error.message
        };
      }

      return {
        success: false,
        error: 'Error inesperado en el registro. Por favor intenta nuevamente.',
        message: error instanceof Error ? error.message : 'Error desconocido'
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
