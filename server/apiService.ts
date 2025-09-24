import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = 'https://shopnro.hitly.click';

// API Response Types
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface User {
  id: string;
  fullname: string;
  email: string;
  phone?: string;
  balance?: number;
  isAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  fullname: string;
  email: string;
  password: string;
}

interface UpdateProfileRequest {
  fullname?: string;
  phone?: string;
}

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

class ApiService {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired, clear stored token
          this.accessToken = null;
        }
        return Promise.reject(error);
      }
    );
  }

  // Set access token for authenticated requests
  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  // Get current access token
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<ApiResponse<AuthTokens & { user: User }>> {
    try {
      const response: AxiosResponse<ApiResponse<AuthTokens & { user: User }>> = 
        await this.client.post('/api/v1/auth/login', data);
      
      if (response.data.success && response.data.data?.accessToken) {
        this.setAccessToken(response.data.data.accessToken);
      }
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async register(data: RegisterRequest): Promise<ApiResponse<AuthTokens & { user: User }>> {
    try {
      const response: AxiosResponse<ApiResponse<AuthTokens & { user: User }>> = 
        await this.client.post('/api/v1/auth/register', data);
      
      if (response.data.success && response.data.data?.accessToken) {
        this.setAccessToken(response.data.data.accessToken);
      }
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getMe(): Promise<ApiResponse<User>> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = 
        await this.client.get('/api/v1/auth/me');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = 
        await this.client.put('/api/v1/auth/me', data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = 
        await this.client.put('/api/v1/auth/change-password', data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = 
        await this.client.post('/api/v1/auth/forgot-password', data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async refreshToken(data: RefreshTokenRequest): Promise<ApiResponse<AuthTokens>> {
    try {
      const response: AxiosResponse<ApiResponse<AuthTokens>> = 
        await this.client.post('/api/v1/auth/refresh-tokens', data);
      
      if (response.data.success && response.data.data?.accessToken) {
        this.setAccessToken(response.data.data.accessToken);
      }
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // User management endpoints (Admin)
  async createUser(data: RegisterRequest): Promise<ApiResponse<User>> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = 
        await this.client.post('/api/v1/users', data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getUsers(params?: { filter?: string; keyword?: string }): Promise<ApiResponse<User[]>> {
    try {
      const response: AxiosResponse<ApiResponse<User[]>> = 
        await this.client.get('/api/v1/users', { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Logout (client-side token cleanup)
  logout() {
    this.accessToken = null;
  }

  // Private helper method for error handling
  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    } else if (error.message) {
      return new Error(error.message);
    } else {
      return new Error('An unexpected error occurred');
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types for use in other files
export type {
  ApiResponse,
  AuthTokens,
  User,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  RefreshTokenRequest,
};