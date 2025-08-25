import React from 'react';
import { isOAuthConfigured, getGoogleAuthUrl, getGitHubAuthUrl } from '../../config/oauth';

export default function OAuthDebug() {
  const config = isOAuthConfigured();
  
  const testGoogle = () => {
    try {
      const url = getGoogleAuthUrl();
      console.log('🔗 Google OAuth URL:', url);
      alert(`Google OAuth URL generada:\n${url}`);
    } catch (error) {
      console.error('❌ Error Google OAuth:', error);
      alert(`Error Google OAuth: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };
  
  const testGitHub = () => {
    try {
      const url = getGitHubAuthUrl();
      console.log('🔗 GitHub OAuth URL:', url);
      alert(`GitHub OAuth URL generada:\n${url}`);
    } catch (error) {
      console.error('❌ Error GitHub OAuth:', error);
      alert(`Error GitHub OAuth: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  return (
    <div className="rounded-md bg-blue-50 p-4 text-xs mb-4">
      <div className="text-blue-700">
        <strong>🔍 Debug OAuth:</strong><br/>
        Google: {config.google ? '✅' : '❌'}<br/>
        GitHub: {config.github ? '✅' : '❌'}<br/>
        <br/>
        <button
          onClick={testGoogle}
          className="px-2 py-1 bg-blue-600 text-white rounded text-xs mr-2 hover:bg-blue-700"
        >
          Probar Google
        </button>
        <button
          onClick={testGitHub}
          className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
        >
          Probar GitHub
        </button>
      </div>
    </div>
  );
}
