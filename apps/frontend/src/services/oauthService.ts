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
    const backendUrl = this.getApiBaseUrl();
    const googleAuthUrl = `${backendUrl}/auth/google`;
    
    // Redirigir al backend para iniciar el flujo de OAuth
    window.location.href = googleAuthUrl;
  }

  // Iniciar autenticación con GitHub
  initiateGitHubAuth(): void {
    const backendUrl = this.getApiBaseUrl();
    const githubAuthUrl = `${backendUrl}/auth/github`;
    
    // Redirigir al backend para iniciar el flujo de OAuth
    window.location.href = githubAuthUrl;
  }

  // Verificar si OAuth está configurado
  isOAuthConfigured(): boolean {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    
    return !!(googleClientId || githubClientId);
  }

  // Verificar si Google OAuth está configurado
  isGoogleOAuthConfigured(): boolean {
    return !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  }

  // Verificar si GitHub OAuth está configurado
  isGitHubOAuthConfigured(): boolean {
    return !!process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
  }
}

export const oauthService = new OAuthService();
export default oauthService;
