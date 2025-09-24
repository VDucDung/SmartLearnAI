import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, getTokens, setTokens, getUser, setUser } from '@/lib/queryClient';
import type { AuthContextType, LoginRequest, RegisterRequest, JWTTokens, ExternalUser } from '@shared/authTypes';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Initialize auth state from localStorage
  const [tokens, setTokensState] = useState<JWTTokens | null>(getTokens());
  const [user, setUserState] = useState<ExternalUser | null>(getUser());

  // Query to fetch current user
  const { data: fetchedUser, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    enabled: false, // We'll manually trigger this
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        const { accessToken, refreshToken, user: userData } = data.data;
        const newTokens = { accessToken, refreshToken };
        
        setTokens(newTokens);
        setUser(userData);
        setTokensState(newTokens);
        setUserState(userData);
        
        // Invalidate and refetch user data
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      }
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
      throw error;
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await apiRequest('POST', '/api/auth/register', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        const { accessToken, refreshToken, user: userData } = data.data;
        const newTokens = { accessToken, refreshToken };
        
        setTokens(newTokens);
        setUser(userData);
        setTokensState(newTokens);
        setUserState(userData);
        
        // Invalidate and refetch user data
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      }
    },
    onError: (error: any) => {
      console.error('Register failed:', error);
      throw error;
    },
  });

  // Refresh token mutation
  const refreshTokenMutation = useMutation({
    mutationFn: async (refreshToken: string) => {
      const response = await apiRequest('POST', '/api/auth/refresh-token', { refreshToken });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        const { accessToken, refreshToken } = data.data;
        const newTokens = { accessToken, refreshToken };
        
        setTokens(newTokens);
        setTokensState(newTokens);
        
        // Refetch user data with new token
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      }
    },
    onError: (error: any) => {
      console.error('Token refresh failed:', error);
      // Clear tokens on refresh failure
      handleLogout();
    },
  });

  // Logout function
  const handleLogout = async () => {
    try {
      // Call logout endpoint to clear server-side data
      await apiRequest('POST', '/api/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local storage and state
      setTokens(null);
      setUser(null);
      setTokensState(null);
      setUserState(null);
      
      // Clear all queries
      queryClient.clear();
    }
  };

  // Refresh token function
  const handleRefreshToken = async (): Promise<boolean> => {
    if (!tokens?.refreshToken) return false;
    
    try {
      await refreshTokenMutation.mutateAsync(tokens.refreshToken);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { fullname?: string; phone?: string }) => {
      const response = await apiRequest('PUT', '/api/auth/profile', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        setUser(data.data);
        setUserState(data.data);
        
        // Invalidate and refetch user data
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      }
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { oldPassword: string; newPassword: string }) => {
      const response = await apiRequest('PUT', '/api/auth/change-password', data);
      return response.json();
    },
  });

  // Initialize authentication on app start
  useEffect(() => {
    const initAuth = async () => {
      const storedTokens = getTokens();
      const storedUser = getUser();

      if (storedTokens && storedUser) {
        setTokensState(storedTokens);
        setUserState(storedUser);

        // Try to verify the token by fetching user data
        try {
          const response = await fetch('/api/auth/user', {
            headers: {
              Authorization: `Bearer ${storedTokens.accessToken}`,
            },
            credentials: 'include',
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setUserState(userData);
          } else if (response.status === 401 && storedTokens.refreshToken) {
            // Token expired, try to refresh
            const refreshed = await handleRefreshToken();
            if (!refreshed) {
              // Refresh failed, clear everything
              await handleLogout();
            }
          } else {
            // Clear invalid tokens
            await handleLogout();
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          await handleLogout();
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const contextValue: AuthContextType = {
    user,
    tokens,
    login: async (credentials: LoginRequest) => {
      await loginMutation.mutateAsync(credentials);
    },
    register: async (data: RegisterRequest) => {
      await registerMutation.mutateAsync(data);
    },
    logout: handleLogout,
    refreshToken: handleRefreshToken,
    updateProfile: async (data: { fullname?: string; phone?: string }) => {
      await updateProfileMutation.mutateAsync(data);
    },
    changePassword: async (data: { oldPassword: string; newPassword: string }) => {
      await changePasswordMutation.mutateAsync(data);
    },
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    isAuthenticated: !!user && !!tokens,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};