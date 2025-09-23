// OAuth configuration and service handlers
export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
  authUrl: string;
}

export interface OAuthProvider {
  id: string;
  name: string;
  config: OAuthConfig;
}

// OAuth providers configuration
export const oauthProviders: Record<string, OAuthProvider> = {
  github: {
    id: 'github',
    name: 'GitHub',
    config: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      redirectUri: `${window.location.origin}/auth/callback/github`,
      scope: 'repo,read:user,user:email,read:org',
      authUrl: 'https://github.com/login/oauth/authorize'
    }
  },
  figma: {
    id: 'figma',
    name: 'Figma',
    config: {
      clientId: process.env.FIGMA_CLIENT_ID || '',
      redirectUri: `${window.location.origin}/auth/callback/figma`,
      scope: 'file_read',
      authUrl: 'https://www.figma.com/oauth'
    }
  },
  atlassian: {
    id: 'atlassian',
    name: 'Atlassian',
    config: {
      clientId: process.env.ATLASSIAN_CLIENT_ID || '',
      redirectUri: `${window.location.origin}/auth/callback/atlassian`,
      scope: 'read:jira-work read:jira-user offline_access read:confluence-content.summary',
      authUrl: 'https://auth.atlassian.com/authorize'
    }
  }
};

// Generate OAuth authorization URL
export const generateAuthUrl = (providerId: string): string => {
  const provider = oauthProviders[providerId];
  if (!provider) {
    throw new Error(`Unknown OAuth provider: ${providerId}`);
  }

  const { clientId, redirectUri, scope, authUrl } = provider.config;
  
  // Generate state parameter for security
  const state = btoa(JSON.stringify({
    provider: providerId,
    timestamp: Date.now(),
    nonce: Math.random().toString(36).substring(2)
  }));

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    state,
    response_type: 'code'
  });

  // Add provider-specific parameters
  if (providerId === 'atlassian') {
    params.append('audience', 'api.atlassian.com');
    params.append('prompt', 'consent');
  }

  return `${authUrl}?${params.toString()}`;
};

// Handle OAuth callback
export const handleOAuthCallback = async (
  code: string,
  state: string,
  providerId: string
): Promise<{ success: boolean; accessToken?: string; error?: string }> => {
  try {
    // Verify state parameter
    const stateData = JSON.parse(atob(state));
    if (stateData.provider !== providerId) {
      throw new Error('Invalid state parameter');
    }

    // Exchange code for access token via backend
    const response = await fetch('/api/oauth/exchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        provider: providerId,
        redirectUri: oauthProviders[providerId].config.redirectUri
      })
    });

    if (!response.ok) {
      throw new Error('Token exchange failed');
    }

    const data = await response.json();
    
    // Store token securely (in real app, this would be handled by backend)
    localStorage.setItem(`${providerId}_token`, data.access_token);
    localStorage.setItem(`${providerId}_connected`, 'true');

    return { success: true, accessToken: data.access_token };
  } catch (error) {
    console.error(`OAuth callback error for ${providerId}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Check if provider is connected
export const isProviderConnected = (providerId: string): boolean => {
  return localStorage.getItem(`${providerId}_connected`) === 'true';
};

// Get stored access token
export const getAccessToken = (providerId: string): string | null => {
  return localStorage.getItem(`${providerId}_token`);
};

// Disconnect provider
export const disconnectProvider = (providerId: string): void => {
  localStorage.removeItem(`${providerId}_token`);
  localStorage.removeItem(`${providerId}_connected`);
};

// Refresh token if needed
export const refreshToken = async (providerId: string): Promise<string | null> => {
  const refreshToken = localStorage.getItem(`${providerId}_refresh_token`);
  if (!refreshToken) return null;

  try {
    const response = await fetch('/api/oauth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
        provider: providerId
      })
    });

    if (!response.ok) throw new Error('Token refresh failed');

    const data = await response.json();
    localStorage.setItem(`${providerId}_token`, data.access_token);
    
    return data.access_token;
  } catch (error) {
    console.error(`Token refresh error for ${providerId}:`, error);
    return null;
  }
};