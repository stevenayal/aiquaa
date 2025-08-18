import { getApiBaseUrl } from './authService';

class OAuthService {
  private getBackendUrl(): string {
    return getApiBaseUrl();
  }

  // Iniciar autenticación con Google
  initiateGoogleAuth(): void {
    const backendUrl = this.getBackendUrl();
    const googleAuthUrl = `${backendUrl}/auth/google`;
    
    // Redirigir al backend para iniciar el flujo de OAuth
    window.location.href = googleAuthUrl;
  }

  // Iniciar autenticación con GitHub
  initiateGitHubAuth(): void {
    const backendUrl = this.getBackendUrl();
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
