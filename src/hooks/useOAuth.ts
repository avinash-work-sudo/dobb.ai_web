import { useState, useEffect, useCallback } from 'react';
import { 
  generateAuthUrl, 
  handleOAuthCallback, 
  isProviderConnected, 
  disconnectProvider,
  oauthProviders 
} from '@/services/oauth';
import { useToast } from '@/hooks/use-toast';

export interface UseOAuthReturn {
  connectedAccounts: string[];
  isConnected: (providerId: string) => boolean;
  connectProvider: (providerId: string) => void;
  disconnectProvider: (providerId: string) => void;
  isLoading: boolean;
}

export const useOAuth = (): UseOAuthReturn => {
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check initial connection status
  useEffect(() => {
    const checkConnections = () => {
      const connected = Object.keys(oauthProviders).filter(providerId => 
        isProviderConnected(providerId)
      );
      setConnectedAccounts(connected);
    };

    checkConnections();

    // Listen for storage changes (in case user connects in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.endsWith('_connected')) {
        checkConnections();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handle OAuth callback from URL
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        toast({
          title: "Authentication Error",
          description: `OAuth error: ${error}`,
          variant: "destructive"
        });
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (code && state) {
        setIsLoading(true);
        try {
          const stateData = JSON.parse(atob(state));
          const providerId = stateData.provider;
          
          const result = await handleOAuthCallback(code, state, providerId);
          
          if (result.success) {
            setConnectedAccounts(prev => 
              prev.includes(providerId) ? prev : [...prev, providerId]
            );
            toast({
              title: "Connection Successful",
              description: `Successfully connected to ${oauthProviders[providerId].name}`,
            });
          } else {
            toast({
              title: "Connection Failed",
              description: result.error || "Failed to connect account",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('OAuth callback handling error:', error);
          toast({
            title: "Connection Failed",
            description: "An error occurred during authentication",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    handleCallback();
  }, [toast]);

  const connectProvider = useCallback((providerId: string) => {
    try {
      const authUrl = generateAuthUrl(providerId);
      // Open OAuth flow in same window
      window.location.href = authUrl;
    } catch (error) {
      console.error(`Error connecting to ${providerId}:`, error);
      toast({
        title: "Connection Error",
        description: `Failed to initiate connection to ${oauthProviders[providerId]?.name || providerId}`,
        variant: "destructive"
      });
    }
  }, [toast]);

  const handleDisconnectProvider = useCallback((providerId: string) => {
    disconnectProvider(providerId);
    setConnectedAccounts(prev => prev.filter(id => id !== providerId));
    toast({
      title: "Disconnected",
      description: `Disconnected from ${oauthProviders[providerId]?.name || providerId}`,
    });
  }, [toast]);

  const isConnected = useCallback((providerId: string) => {
    return connectedAccounts.includes(providerId);
  }, [connectedAccounts]);

  return {
    connectedAccounts,
    isConnected,
    connectProvider,
    disconnectProvider: handleDisconnectProvider,
    isLoading
  };
};