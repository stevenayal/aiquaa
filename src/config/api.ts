// API Configuration
export const API_CONFIG = {
  // Backend API configuration
  getApiBaseUrl: () => {
    // Check for Vite environment variable first
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
    
    // Fallback based on environment
    if (import.meta.env.MODE === 'production') {
      return 'https://api.aiquaa.com'; // URL del backend en producción
    }
    
    // Force localhost for development
    return 'http://localhost:3001';
  },

  // Debug logging (only in development)
  debug: () => {
    if (import.meta.env.MODE === 'development') {
      console.log('🔧 API Base URL:', API_CONFIG.getApiBaseUrl());
      console.log('🔧 Environment:', import.meta.env.MODE);
      console.log('🔧 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
      console.log('🔧 Using fallback URL for development');
    }
  }
};

// Initialize debug logging
API_CONFIG.debug(); 