class OAuthService {
  private getApiBaseUrl(): string {
    const urlFromEnv = process.env.NEXT_PUBLIC_API_URL;
    if (urlFromEnv && urlFromEnv.length > 0) {
      return urlFromEnv;
    }

    if (process.env.NODE_ENV !== 'production') {
      return 'http://localhost:3001';
    }

    // En producción, usar un valor por defecto en lugar de lanzar un error
    return 'https://api.aiquaa.com';
  }

  // Iniciar autenticación con Google
  initiateGoogleAuth(): void {
    try {
      const backendUrl = this.getApiBaseUrl();
      const googleAuthUrl = `${backendUrl}/auth/google`;
      
      console.log('🚀 Iniciando autenticación con Google...');
      console.log('📍 URL del backend:', backendUrl);
      console.log('🔗 URL de autenticación:', googleAuthUrl);
      
      // Redirigir al backend para iniciar el flujo de OAuth
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error('❌ Error iniciando autenticación con Google:', error);
      throw new Error('No se pudo iniciar la autenticación con Google');
    }
  }

  // Iniciar autenticación con GitHub
  initiateGitHubAuth(): void {
    try {
      const backendUrl = this.getApiBaseUrl();
      const githubAuthUrl = `${backendUrl}/auth/github`;
      
      console.log('🚀 Iniciando autenticación con GitHub...');
      console.log('📍 URL del backend:', backendUrl);
      console.log('🔗 URL de autenticación:', githubAuthUrl);
      
      // Redirigir al backend para iniciar el flujo de OAuth
      window.location.href = githubAuthUrl;
    } catch (error) {
      console.error('❌ Error iniciando autenticación con GitHub:', error);
      throw new Error('No se pudo iniciar la autenticación con GitHub');
    }
  }

  // Verificar si OAuth está configurado
  isOAuthConfigured(): boolean {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    
    console.log('🔍 Verificando configuración de OAuth...');
    console.log('📱 Google Client ID:', googleClientId ? '✅ Configurado' : '❌ No configurado');
    console.log('📱 GitHub Client ID:', githubClientId ? '✅ Configurado' : '❌ No configurado');
    
    return !!(googleClientId || githubClientId);
  }

  // Verificar si Google OAuth está configurado
  isGoogleOAuthConfigured(): boolean {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const isConfigured = !!clientId;
    
    console.log('🔍 Verificando Google OAuth:', isConfigured ? '✅ Configurado' : '❌ No configurado');
    if (!isConfigured) {
      console.warn('⚠️  NEXT_PUBLIC_GOOGLE_CLIENT_ID no está configurado');
    }
    
    return isConfigured;
  }

  // Verificar si GitHub OAuth está configurado
  isGitHubOAuthConfigured(): boolean {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const isConfigured = !!clientId;
    
    console.log('🔍 Verificando GitHub OAuth:', isConfigured ? '✅ Configurado' : '❌ No configurado');
    if (!isConfigured) {
      console.warn('⚠️  NEXT_PUBLIC_GITHUB_CLIENT_ID no está configurado');
    }
    
    return isConfigured;
  }

  // Método para debugging
  debugOAuthConfig(): void {
    console.log('🔍 === DEBUG OAUTH CONFIGURATION ===');
    console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
    console.log('🔗 NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('🔗 NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
    console.log('📱 NEXT_PUBLIC_GOOGLE_CLIENT_ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
    console.log('📱 NEXT_PUBLIC_GITHUB_CLIENT_ID:', process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID);
    console.log('📍 Backend URL calculada:', this.getApiBaseUrl());
    console.log('=====================================');
  }
}

export const oauthService = new OAuthService();
export default oauthService;
