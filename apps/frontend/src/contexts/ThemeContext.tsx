'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        return JSON.parse(saved);
      }
      return true;
    }
    return true;
  });

  useEffect(() => {
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', JSON.stringify(isDarkMode));

      // Apply theme to document.
      // Se aplican AMBAS clases de forma explícita: `dark` activa las utilidades
      // `dark:` de Tailwind y los tokens de globals.css; `light` marca la
      // elección explícita del usuario para que el fallback
      // `@media (prefers-color-scheme: dark)` no la pise cuando el sistema
      // operativo está en modo oscuro.
      const root = document.documentElement;
      root.classList.toggle('dark', isDarkMode);
      root.classList.toggle('light', !isDarkMode);
      root.style.colorScheme = isDarkMode ? 'dark' : 'light';
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
