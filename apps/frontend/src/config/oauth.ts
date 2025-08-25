// Configuración de OAuth para Google y GitHub
export const oauthConfig = {
  google: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scope: 'openid email profile',
    responseType: 'code'
  },
  github: {
    clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
    authUrl: 'https://github.com/login/oauth/authorize',
    scope: 'user:email',
    responseType: 'code'
  }
};

// Verificar si OAuth está configurado
export const isOAuthConfigured = () => {
  return {
    google: !!oauthConfig.google.clientId,
    github: !!oauthConfig.github.clientId
  };
};

// Obtener URL de redirección
export const getRedirectUri = () => {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/oauth-callback`;
};

// Generar URL de autorización para Google
export const getGoogleAuthUrl = () => {
  const { clientId, authUrl, scope, responseType } = oauthConfig.google;
  const redirectUri = getRedirectUri();
  
  if (!clientId) {
    throw new Error('Google OAuth no está configurado. NEXT_PUBLIC_GOOGLE_CLIENT_ID no encontrado.');
  }
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: responseType,
    scope: scope
  });
  
  return `${authUrl}?${params.toString()}`;
};

// Generar URL de autorización para GitHub
export const getGitHubAuthUrl = () => {
  const { clientId, authUrl, scope } = oauthConfig.github;
  const redirectUri = getRedirectUri();
  
  if (!clientId) {
    throw new Error('GitHub OAuth no está configurado. NEXT_PUBLIC_GITHUB_CLIENT_ID no encontrado.');
  }
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scope
  });
  
  return `${authUrl}?${params.toString()}`;
};
